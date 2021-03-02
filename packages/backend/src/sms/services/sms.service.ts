import { Injectable } from "@nestjs/common";
import moment = require("moment");

import { Repository } from "typeorm";
import { appTypeormManager, UsagerLight } from "../../database";
import { MessageSmsTable } from "../../database/entities/message-sms/MessageSmsTable.typeorm";
import { InteractionDto } from "../../interactions/interactions.dto";
import { AppAuthUser } from "../../_common/model";
import { MessageSms } from "../../_common/model/message-sms";
import { generateSmsInteraction } from "./generateSmsInteraction.service";

@Injectable()
export class SmsService {
  // Délai entre chaque message envoyé
  public interactionDelay: number = 60 * 60;
  private messageSmsRepository: Repository<MessageSmsTable>;

  constructor() {
    this.messageSmsRepository = appTypeormManager.getRepository(
      MessageSmsTable
    );
  }

  public async createSmsInteraction(
    usager: UsagerLight,
    user: AppAuthUser,
    interaction: InteractionDto
  ) {
    const content = generateSmsInteraction(usager, interaction);

    console.log(content);
    console.log(interaction);

    const createdSms: MessageSms = {
      // Infos sur l'usager
      usagerRef: usager.ref,
      structureId: user.structureId,
      content,
      smsId: "courrierIn",
      scheduledDate: moment().add(2, "hours").toDate(),
    };

    // Check if exist
    return this.messageSmsRepository.insert(createdSms);
  }

  // Messages de rappel de renouvellement
  public renewReminder() {}
}
