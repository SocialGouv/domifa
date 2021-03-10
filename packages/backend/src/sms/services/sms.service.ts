import moment = require("moment");
import { Injectable } from "@nestjs/common";

import { UsagerLight } from "../../database";

import { messageSmsRepository } from "../../database/services/message-sms";
import { InteractionDto } from "../../interactions/interactions.dto";
import { AppAuthUser } from "../../_common/model";

import { MessageSms } from "../../_common/model/message-sms";
import { generateSmsInteraction } from "./generateSmsInteraction.service";

@Injectable()
export class SmsService {
  // Délai entre chaque message envoyé
  public interactionDelay: number = 60 * 60;

  constructor() {}

  public async deleteSmsInteraction(
    usager: UsagerLight,
    user: AppAuthUser,
    interaction: InteractionDto
  ) {
    const hour = moment().set({ hour: 22, minute: 0, second: 0 }).toDate();

    const smsOnHold = await messageSmsRepository.findSmsOnHold({
      usager,
      user,
      sendDate: hour,
      interactionType: interaction.type,
    });

    if (smsOnHold) {
      smsOnHold.interactionMetas.nbCourrier =
        smsOnHold.interactionMetas.nbCourrier - interaction.nbCourrier;

      if (smsOnHold.interactionMetas.nbCourrier === 0) {
        return messageSmsRepository.updateOne(
          { uuid: smsOnHold.uuid },
          smsOnHold
        );
      }

      return messageSmsRepository.deleteByCriteria(smsOnHold);
    } else {
      // ERROR
    }
  }

  public async createSmsInteraction(
    usager: UsagerLight,
    user: AppAuthUser,
    interaction: InteractionDto
  ) {
    const hour = moment().set({ hour: 22, minute: 0, second: 0 }).toDate();

    const smsReady = await messageSmsRepository.findSmsOnHold({
      usager,
      user,
      sendDate: hour,
      interactionType: interaction.type,
    });

    if (smsReady) {
      smsReady.interactionMetas.nbCourrier =
        smsReady.interactionMetas.nbCourrier + interaction.nbCourrier;
      return messageSmsRepository.updateOne({ uuid: smsReady.uuid }, smsReady);
    }

    const content = generateSmsInteraction(usager, interaction);

    const createdSms: MessageSms = {
      // Infos sur l'usager
      usagerRef: usager.ref,
      structureId: user.structureId,
      sendDate: moment().set({ hour: 21, minute: 0, second: 0 }).toDate(),
      content,
      smsId: interaction.type,
      scheduledDate: moment().add(2, "hours").toDate(),
      interactionMetas: {
        nbCourrier: interaction.nbCourrier,
        date: new Date(),
        interactionType: interaction.type,
      },
    };
    return messageSmsRepository.save(createdSms);
  }

  // Messages de rappel de renouvellement
  public renewReminder() {}
}
