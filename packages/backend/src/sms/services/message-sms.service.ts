import { Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { Repository } from "typeorm";
import { AxiosError } from "axios";

import { appTypeormManager, structureRepository } from "../../database";
import { domifaConfig } from "../../config";
import { INDEX_STATUT } from "../../_common/model/message-sms/MESSAGE_SMS_SUIVI_INDEX.const";
import { MessageSmsTable } from "../../database/entities/message-sms/MessageSmsTable.typeorm";
import { messageSmsRepository } from "../../database/services/message-sms";
import { InteractionDto } from "../../interactions/dto";
import { appLogger } from "../../util";
import {
  MessageSms,
  Usager,
  UsagerLight,
  Structure,
  StructureSmsParams,
  MESSAGE_SMS_RESPONSE_ERRORS,
} from "../../_common/model";
import { generateSmsInteraction } from "./generators";
import { MESSAGE_SMS_STATUS } from "../../_common/model/message-sms/MESSAGE_SMS_STATUS.const";
import { generateScheduleSendDate } from "./generators/generateScheduleSendDate";
import { telephoneFixCountryCode } from "../../util/phone/telephoneString.service";
import { firstValueFrom } from "rxjs";

@Injectable()
export class MessageSmsService {
  // Délai entre chaque message envoyé
  private messageSmsRepository: Repository<MessageSmsTable>;

  public constructor(private httpService: HttpService) {
    this.messageSmsRepository =
      appTypeormManager.getRepository(MessageSmsTable);
  }

  public async updateMessageSmsStatut(smsToUpdate: MessageSms) {
    //
    const options: {
      key: string;
      id: string;
    } = {
      key: domifaConfig().sms.apiKey,
      id: smsToUpdate.responseId,
    };

    const endPoint =
      "https://www.spot-hit.fr/api/dlr?key=" +
      options.key +
      "&id=" +
      encodeURIComponent(options.id);

    try {
      const response = await firstValueFrom(this.httpService.get(endPoint));

      if (response.data?.resultat === false) {
        smsToUpdate.status = "FAILURE";
        smsToUpdate.errorCount++;
        smsToUpdate.errorMessage =
          MESSAGE_SMS_RESPONSE_ERRORS[response.data.erreurs];
      } else {
        smsToUpdate.status = MESSAGE_SMS_STATUS[response.data[0][INDEX_STATUT]];
      }
    } catch (err) {
      console.log("[SMS] Status update fail " + smsToUpdate.uuid);
      smsToUpdate.status = "FAILURE";
      smsToUpdate.errorCount++;
      smsToUpdate.errorMessage = (err as AxiosError)?.message;
    }

    smsToUpdate.lastUpdate = new Date();

    const messageSms = await messageSmsRepository.updateOne(
      { uuid: smsToUpdate.uuid },
      smsToUpdate
    );

    return messageSms;
  }

  // Suppression d'un SMS si le courrier a été distribué
  public async deleteSmsInteractionOut(
    usager: Pick<Usager, "ref" | "preference">,
    structureId: number,
    interaction: InteractionDto
  ) {
    const smsOnHold = await messageSmsRepository.findSmsOnHold({
      usagerRef: usager.ref,
      structureId,
      interactionType: interaction.type,
    });

    if (smsOnHold) {
      return messageSmsRepository.deleteByCriteria({ uuid: smsOnHold.uuid });
    }
    return;
  }

  // Suppression d'un SMS si l'interaction a été supprimée
  public async deleteSmsInteraction(
    usager: Pick<Usager, "ref" | "preference">,
    structureId: number,
    interaction: InteractionDto
  ) {
    const smsOnHold = await messageSmsRepository.findSmsOnHold({
      usagerRef: usager.ref,
      structureId,
      interactionType: interaction.type,
    });

    if (smsOnHold) {
      smsOnHold.interactionMetas.nbCourrier =
        smsOnHold.interactionMetas.nbCourrier - interaction.nbCourrier;

      if (smsOnHold.interactionMetas.nbCourrier > 0) {
        return messageSmsRepository.updateOne(
          { uuid: smsOnHold.uuid },
          { interactionMetas: smsOnHold.interactionMetas }
        );
      } else {
        return messageSmsRepository.deleteByCriteria({ uuid: smsOnHold.uuid });
      }
    } else if (usager.preference?.phone === true) {
      appLogger.warn(`SMS Service: Interaction to delete not found`);
    }
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

      return messageSmsRepository.updateOne(
        { uuid: smsReady.uuid },
        { content, interactionMetas: smsReady.interactionMetas }
      );
    } else {
      const content = generateSmsInteraction(
        interaction,
        structure.sms.senderDetails
      );

      const createdSms: MessageSms = {
        // Infos sur l'usager
        usagerRef: usager.ref,
        structureId: structure.id,
        content,
        senderName: structure.sms.senderName,
        status: "TO_SEND",
        smsId: interaction.type,
        phoneNumber: telephoneFixCountryCode(
          structure.telephone.countryCode,
          usager.preference.phoneNumber
        ),
        scheduledDate,
        errorCount: 0,
        interactionMetas: {
          nbCourrier: interaction.nbCourrier,
          date: new Date(),
          interactionType: interaction.type,
        },
      };

      return messageSmsRepository.save(createdSms);
    }
  }

  // Afficher les SMS en attente d'envoi
  public findAll(usager: UsagerLight): Promise<MessageSmsTable[]> {
    return this.messageSmsRepository.find({
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
    return structureRepository.updateOne(
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
  }
}
