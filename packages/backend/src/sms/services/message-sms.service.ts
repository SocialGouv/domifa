import { Injectable } from "@nestjs/common";

import { structureRepository } from "../../database";

import { messageSmsRepository } from "../../database/services/message-sms";
import { InteractionDto } from "../../interactions/dto";

import {
  MessageSms,
  Usager,
  UsagerLight,
  Structure,
  StructureSmsParams,
  Interactions,
  INTERACTION_IN_CREATE_SMS,
  INTERACTION_OUT_REMOVE_SMS,
} from "../../_common/model";
import { generateSmsInteraction } from "./generators";
import { generateScheduleSendDate } from "./generators/generateScheduleSendDate";

import { getPhoneString } from "../../util/phone/phoneUtils.service";
import { interactionsTypeManager } from "../../interactions/services";
import { PhoneNumberFormat } from "google-libphonenumber";

@Injectable()
export class MessageSmsService {
  // Suppression d'un SMS si le courrier a été distribué
  public async deleteSmsInteractionOut(
    usager: Pick<Usager, "ref" | "contactByPhone">,
    structure: Pick<Structure, "id" | "sms" | "telephone">,
    interaction: InteractionDto
  ) {
    if (!structure.sms.enabledByDomifa && !structure.sms.enabledByStructure) {
      return null;
    }

    const smsOnHold = await messageSmsRepository.findSmsOnHold({
      usagerRef: usager.ref,
      structureId: structure.id,
      interactionType: interaction.type,
    });

    if (smsOnHold) {
      return messageSmsRepository.delete({ uuid: smsOnHold.uuid });
    }
    return null;
  }

  // Suppression d'un SMS si l'interaction a été supprimée
  public async deleteSmsInteraction(
    usager: Pick<Usager, "ref" | "contactByPhone">,
    structure: Pick<Structure, "id" | "sms" | "telephone">,
    interaction: InteractionDto
  ) {
    if (!structure.sms.enabledByDomifa && !structure.sms.enabledByStructure) {
      return null;
    }

    const smsOnHold = await messageSmsRepository.findSmsOnHold({
      usagerRef: usager.ref,
      structureId: structure.id,
      interactionType: interaction.type,
    });

    if (!smsOnHold) {
      return true;
    }

    smsOnHold.interactionMetas.nbCourrier =
      smsOnHold.interactionMetas.nbCourrier - interaction.nbCourrier;

    if (smsOnHold.interactionMetas.nbCourrier > 0) {
      return messageSmsRepository.update(
        { uuid: smsOnHold.uuid },
        { interactionMetas: smsOnHold.interactionMetas }
      );
    }
    return messageSmsRepository.delete({ uuid: smsOnHold.uuid });
  }

  public async createSmsInteraction(
    usager: UsagerLight,
    structure: Pick<Structure, "id" | "sms" | "telephone">,
    interaction: InteractionDto
  ) {
    const scheduledDate = generateScheduleSendDate(new Date());

    const smsReady: MessageSms = await messageSmsRepository.findSmsOnHold({
      usagerRef: usager.ref,
      structureId: structure.id,
      interactionType: interaction.type,
    });

    if (smsReady) {
      smsReady.interactionMetas.nbCourrier =
        smsReady.interactionMetas.nbCourrier + interaction.nbCourrier;
      const content = generateSmsInteraction(
        interaction,
        structure.sms.senderDetails
      );

      smsReady.interactionMetas.date = new Date();

      await messageSmsRepository.update(
        { uuid: smsReady.uuid },
        { content, interactionMetas: smsReady.interactionMetas }
      );

      return messageSmsRepository.findOneBy({ uuid: smsReady.uuid });
    } else {
      const content = generateSmsInteraction(
        interaction,
        structure.sms.senderDetails
      );

      const createdSms: MessageSms = {
        usagerRef: usager.ref,
        structureId: structure.id,
        content,
        senderName: structure.sms.senderName,
        status: "TO_SEND",
        smsId: interaction.type,
        phoneNumber: getPhoneString(usager.telephone, PhoneNumberFormat.E164),
        scheduledDate,
        errorCount: 0,
        interactionMetas: {
          nbCourrier: interaction.nbCourrier,
          date: new Date(),
          interactionType: interaction.type,
        },
      };

      return await messageSmsRepository.save(createdSms);
    }
  }

  public async updateSmsAfterCreation({
    interaction,
    structure,
    usager,
  }: {
    interaction: Interactions;
    structure: Pick<Structure, "id" | "sms" | "telephone">;
    usager: UsagerLight;
  }): Promise<void> {
    // 1. Vérifier l'activation des SMS par la structure
    if (
      structure.sms.enabledByDomifa &&
      structure.sms.enabledByStructure &&
      usager.contactByPhone === true
    ) {
      // Courrier / Colis / Recommandé entrant = Envoi de SMS à prévoir
      if (INTERACTION_IN_CREATE_SMS.includes(interaction.type)) {
        await this.createSmsInteraction(usager, structure, interaction);
      }
      // Suppression du SMS en file d'attente
      if (INTERACTION_OUT_REMOVE_SMS.includes(interaction.type)) {
        const inType = interactionsTypeManager.getOppositeDirectionalType({
          type: interaction.type,
        });

        interaction.type = inType;

        await this.deleteSmsInteractionOut(usager, structure, interaction);
      }
    }
    return null;
  }

  // Afficher les SMS en attente d'envoi
  public findAll(usager: UsagerLight): Promise<MessageSms[]> {
    return messageSmsRepository.find({
      where: {
        usagerRef: usager.ref,
        structureId: usager.structureId,
      },
      order: {
        createdAt: "DESC",
      },
      skip: 0,
      take: 10,
    });
  }

  // Mise à jour par DOMIFA de l'autorisation d'envoi de SMS
  public async changeStatutByDomifa(
    structureId: number,
    sms: StructureSmsParams
  ) {
    await structureRepository.update(
      { id: structureId },
      {
        sms: {
          senderName: sms.senderName,
          senderDetails: sms.senderName,
          enabledByDomifa: sms.enabledByDomifa,
          enabledByStructure: sms.enabledByStructure,
        },
      }
    );

    return await structureRepository.findOneBy({ id: structureId });
  }
}
