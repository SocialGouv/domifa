import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { AxiosError } from "axios";

import { domifaConfig } from "../../config";
import {
  monitoringBatchProcessSimpleCountRunner,
  MonitoringBatchProcessTrigger,
} from "../../database";
import { messageSmsRepository } from "../../database/services/message-sms";
import { appLogger } from "../../util";
import { MessageSmsSenderService } from "./message-sms-sender.service";

@Injectable()
export class CronSmsInteractionSenderService {
  constructor(private messageSmsSenderService: MessageSmsSenderService) {}

  @Cron(domifaConfig().cron.smsConsumer.crontime)
  protected async sendSmsImportCron() {
    if (!domifaConfig().cron.enable) {
      return;
    }
    await this.sendSmsImports("cron");
  }

  public async sendSmsImports(trigger: MonitoringBatchProcessTrigger) {
    await monitoringBatchProcessSimpleCountRunner.monitorProcess(
      {
        processId: "sms-messages-consumer",
        trigger,
      },
      async ({ monitorTotal, monitorSuccess, monitorError }) => {
        const messageSmsList = await messageSmsRepository.findSmsToSend();

        monitorTotal(messageSmsList.length);

        for (const messageSms of messageSmsList) {
          this.messageSmsSenderService.sendSms(messageSms).subscribe(
            () => {
              monitorSuccess();
            },
            (error: AxiosError) => {
              appLogger.warn(
                `[CronSms] ERROR in sending SMS : ${error?.message}`,
                {
                  sentryBreadcrumb: true,
                }
              );
            }
          );
        }
      }
    );
  }
}
