import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { Repository } from "typeorm";

import { domifaConfig } from "../../config";
import {
  appTypeormManager,
  MonitoringBatchProcessTrigger,
} from "../../database";
import { MessageSmsTable } from "../../database/entities/message-sms/MessageSmsTable.typeorm";
import { appLogger } from "../../util";

import { MessageSmsSenderService } from "./message-sms-sender.service";
@Injectable()
export class CronSmsInteractionSenderService {
  private messageSmsRepository: Repository<MessageSmsTable>;

  constructor(private messageSmsSenderService: MessageSmsSenderService) {
    this.messageSmsRepository = appTypeormManager.getRepository(
      MessageSmsTable
    );
  }

  @Cron(domifaConfig().cron.smsConsumer.crontime)
  protected async sendSmsImportCron() {
    if (!domifaConfig().cron.enable) {
      return;
    }
    await this.sendSmsImports("cron");
  }

  public async sendSmsImports(trigger: MonitoringBatchProcessTrigger) {
    const messageSmsList = await this._findSmsToSend();

    for (const messageSms of messageSmsList) {
      try {
        await this.messageSmsSenderService.sendSms(messageSms);
      } catch (err) {
        appLogger.warn(
          `[CronSms] Too many errors: skip next users: : ${err.message}`,
          {
            sentryBreadcrumb: true,
          }
        );
        break;
      }
    }
  }

  private async _findSmsToSend(): Promise<MessageSmsTable[]> {
    return this.messageSmsRepository.find({
      where: { status: "TO_SEND" },
      order: {
        scheduledDate: "DESC",
      },
      skip: 0,
      take: 30,
    });
  }
}
