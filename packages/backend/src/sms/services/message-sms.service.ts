import { Injectable } from "@nestjs/common";

import { structureRepository } from "../../database";

import { messageSmsRepository } from "../../database/services/message-sms";

import { generateSmsInteraction } from "./generators";
import { generateScheduleSendDate } from "./generators/generateScheduleSendDate";

import { getPhoneString } from "../../util/phone/phoneUtils.service";
import { interactionsTypeManager } from "../../interactions/services";
import { PhoneNumberFormat } from "google-libphonenumber";
import {
  CommonInteraction,
  INTERACTIONS_IN,
  INTERACTIONS_OUT,
  InteractionType,
  Structure,
  StructureSmsParams,
  MessageSms,
  Usager,
} from "@domifa/common";

@Injectable()
export class MessageSmsService {
  // Suppression d'un SMS si le courrier a été distribué
  public async deleteSmsInteractionOut(
    usager: Pick<Usager, "ref" | "contactByPhone">,
    structure: Pick<Structure, "id" | "sms" | "telephone">,
    interactionType: InteractionType
  ) {
    if (!structure.sms.enabledByDomifa && !structure.sms.enabledByStructure) {
      return null;
    }

    const smsOnHold = await messageSmsRepository.findSmsOnHold({
      usagerRef: usager.ref,
      structureId: structure.id,
      interactionType,
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
    interaction: CommonInteraction
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
    usager: Usager,
    structure: Pick<Structure, "id" | "sms" | "telephone">,
    interaction: CommonInteraction
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
    interaction: CommonInteraction;
    structure: Pick<Structure, "id" | "sms" | "telephone">;
    usager: Usager;
  }): Promise<void> {
    // 1. Vérifier l'activation des SMS par la structure
    if (
      structure.sms.enabledByDomifa &&
      structure.sms.enabledByStructure &&
      usager.contactByPhone
    ) {
      // Courrier / Colis / Recommandé entrant = Envoi de SMS à prévoir
      if (INTERACTIONS_IN.includes(interaction.type)) {
        await this.createSmsInteraction(usager, structure, interaction);
      }
      // Suppression du SMS en file d'attente
      else if (INTERACTIONS_OUT.includes(interaction.type)) {
        const inType = interactionsTypeManager.getOppositeDirectionalType({
          type: interaction.type,
        });
        await this.deleteSmsInteractionOut(usager, structure, inType);
      }
    }
    return null;
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
