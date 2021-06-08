import moment = require("moment");
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { appTypeormManager, structureRepository } from "../../database";
import { MessageSmsTable } from "../../database/entities/message-sms/MessageSmsTable.typeorm";
import { messageSmsRepository } from "../../database/services/message-sms";
import { InteractionDto } from "../../interactions/interactions.dto";
import { appLogger } from "../../util";
import { AppAuthUser, UsagerLight } from "../../_common/model";
import { MessageSms } from "../../_common/model/message-sms";
import { StructureSmsParams } from "./../../_common/model/structure/StructureSmsParams.type";
import { generateSmsInteraction } from "./generators";

@Injectable()
export class SmsService {
  // Délai entre chaque message envoyé
  private messageSmsRepository: Repository<MessageSmsTable>;

  constructor() {
    this.messageSmsRepository =
      appTypeormManager.getRepository(MessageSmsTable);
  }

  // Suppression d'un SMS si le courrier a été distribué
  public async deleteSmsInteractionOut(
    usager: UsagerLight,
    user: AppAuthUser,
    interaction: InteractionDto
  ) {
    const smsOnHold = await messageSmsRepository.findSmsOnHold({
      usager,
      user,
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
    usager: UsagerLight,
    user: AppAuthUser,
    interaction: InteractionDto
  ) {
    const smsOnHold = await messageSmsRepository.findSmsOnHold({
      usager,
      user,
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
    user: AppAuthUser,
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
      usager,
      user,
      interactionType: interaction.type,
    });

    if (smsReady) {
      smsReady.interactionMetas.nbCourrier =
        smsReady.interactionMetas.nbCourrier + interaction.nbCourrier;
      const content = generateSmsInteraction(
        interaction,
        user.structure.sms.senderDetails
      );

      smsReady.interactionMetas.date = new Date();

      return messageSmsRepository.updateOne(
        { uuid: smsReady.uuid },
        { content, interactionMetas: smsReady.interactionMetas }
      );
    } else {
      const content = generateSmsInteraction(
        interaction,
        user.structure.sms.senderDetails
      );

      const createdSms: MessageSms = {
        // Infos sur l'usager
        usagerRef: usager.ref,
        structureId: user.structureId,
        content,
        senderName: user.structure.sms.senderName,
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
  public getTimeline(user: AppAuthUser): Promise<MessageSmsTable[]> {
    return this.messageSmsRepository.find({
      // TODO: ajouter une condition where lors de la livraison : date > 19h aujourd'hui
      where: { structureId: user.structureId, status: "TO_SEND" },
      order: {
        scheduledDate: "DESC",
      },
      skip: 0,
      take: 30,
    });
  }

  // Mise à jour par DOMIFA de l'autorisation d'envoi de SMS
  public changeStatutByDomifa(structureId: number, sms: StructureSmsParams) {
    return structureRepository.updateOne({ id: structureId }, { sms });
  }

  // Messages de rappel de renouvellement
  public renewReminder() {}
}
