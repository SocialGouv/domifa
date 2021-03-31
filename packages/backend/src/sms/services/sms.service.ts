import moment = require("moment");
import { StructureSmsParams } from "./../../_common/model/structure/StructureSmsParams.type";
import { Injectable } from "@nestjs/common";

import {
  appTypeormManager,
  structureRepository,
  UsagerLight,
} from "../../database";

import { messageSmsRepository } from "../../database/services/message-sms";
import { InteractionDto } from "../../interactions/interactions.dto";
import { AppAuthUser } from "../../_common/model";

import { MessageSms } from "../../_common/model/message-sms";

import { MessageSmsTable } from "../../database/entities/message-sms/MessageSmsTable.typeorm";
import { Repository } from "typeorm";
import { generateSmsInteraction } from "./generators";
import { MessageSmsSenderService } from "./message-sms-sender.service";

@Injectable()
export class SmsService {
  // Délai entre chaque message envoyé

  private messageSmsRepository: Repository<MessageSmsTable>;

  constructor(private messageSmsSenderService: MessageSmsSenderService) {
    this.messageSmsRepository = appTypeormManager.getRepository(
      MessageSmsTable
    );
  }

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
    } else {
      // ERROR
    }
  }
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
    } else {
      // ERROR
    }
  }

  public async createSmsInteraction(
    usager: UsagerLight,
    user: AppAuthUser,
    interaction: InteractionDto
  ) {
    const scheduledDate = moment()
      .set({ hour: 19, minutes: 0, second: 0 })
      .toDate();

    const smsReady: MessageSms = await messageSmsRepository.findSmsOnHold({
      usager,
      user,
      interactionType: interaction.type,
    });

    if (smsReady) {
      smsReady.interactionMetas.nbCourrier =
        smsReady.interactionMetas.nbCourrier + interaction.nbCourrier;

    const content = generateSmsInteraction(usager, interaction);

    const createdSms: MessageSms = {
      // Infos sur l'usager
      usagerRef: usager.ref,
      structureId: user.structureId,
      content,
      senderName: user.structure.sms.senderName,
      smsId: interaction.type,
      phoneNumber: usager.preference.phoneNumber,
      scheduledDate: moment().add(2, "hours").toDate(),
      interactionMetas: {
        nbCourrier: interaction.nbCourrier,
        date: new Date(),
        interactionType: interaction.type,
      },
    };

    console.log("APPEL API");

    return this.messageSmsSenderService.sendSms(createdSms);
    return messageSmsRepository.save(createdSms);
  }

  public getTimeline(user: AppAuthUser) {
    return this.messageSmsRepository.find({
      where: { structureId: user.structureId, status: "TO_SEND" },
      order: {
        scheduledDate: "DESC",
      },
      skip: 0,
      take: 30,
    });
  }

  public changeStatutByDomifa(structureId: number, sms: StructureSmsParams) {
    return structureRepository.updateOne(
      {
        id: structureId,
      },
      {
        sms,
      }
    );
  }

  // Messages de rappel de renouvellement
  public renewReminder() {}
}
