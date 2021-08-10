import moment = require("moment");
import { Injectable } from "@nestjs/common";
import { Repository, ReturningStatementNotSupportedError } from "typeorm";
import { appTypeormManager, structureRepository } from "../../database";
import { MessageSmsTable } from "../../database/entities/message-sms/MessageSmsTable.typeorm";
import { messageSmsRepository } from "../../database/services/message-sms";
import { InteractionDto } from "../../interactions/interactions.dto";
import { appLogger } from "../../util";
import {
  AppAuthUser,
  Structure,
  Usager,
  UsagerLight,
} from "../../_common/model";
import { MessageSms } from "../../_common/model/message-sms";
import { StructureSmsParams } from "../../_common/model/structure/StructureSmsParams.type";
import { generateSmsInteraction } from "./generators";
import { MESSAGE_SMS_STATUS } from "../../_common/model/message-sms/MESSAGE_SMS_STATUS.const";
import { SuiviSmsDto } from "../suivi-sms.dto";

@Injectable()
export class MessageSmsService {
  // Délai entre chaque message envoyé
  private messageSmsRepository: Repository<MessageSmsTable>;

  public constructor() {
    this.messageSmsRepository =
      appTypeormManager.getRepository(MessageSmsTable);
  }

  public async updateMessageSmsStatut(suiviSms: SuiviSmsDto) {
    const sms = await messageSmsRepository.findOne({
      responseId: suiviSms.id_accuse,
    });

    if (!sms) {
      appLogger.warn(
        `[UPDATE-SMS-STATUS] Sms not found : ${suiviSms.id_message}`,
        {
          sentryBreadcrumb: true,
        }
      );
      return;
    }

    return messageSmsRepository.updateOne(
      { responseId: suiviSms.id_accuse },
      {
        status: MESSAGE_SMS_STATUS[suiviSms.statut],
        lastUpdate: new Date(),
      }
    );
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
    } else if (usager.preference?.phone === true) {
      appLogger.warn(`SMS Service: Interaction Out not found`);
    }
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
    structure: Pick<Structure, "id" | "sms">,
    interaction: InteractionDto
  ) {
    let scheduledDate = moment()
      .set({
        hour: 19,
        minute: 0,
        second: 0,
        millisecond: 0,
      })
      .toDate();

    if (new Date() > scheduledDate) {
      scheduledDate = moment()
        .add(1, "day")
        .set({
          hour: 19,
          minute: 0,
          second: 0,
          millisecond: 0,
        })
        .toDate();
    }

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
        phoneNumber: usager.preference.phoneNumber,
        scheduledDate,
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
      where: { structureId: usager.structureId, usagerRef: usager.ref },
      order: {
        createdAt: "DESC",
      },
      skip: 0,
      take: 10,
    });
  }

  // Mise à jour par DOMIFA de l'autorisation d'envoi de SMS
  public changeStatutByDomifa(structureId: number, sms: StructureSmsParams) {
    return structureRepository.updateOne({ id: structureId }, { sms });
  }
}
