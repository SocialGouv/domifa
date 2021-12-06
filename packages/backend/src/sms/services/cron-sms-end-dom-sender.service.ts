import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

import { domifaConfig } from "../../config";
import {
  monitoringBatchProcessSimpleCountRunner,
  MonitoringBatchProcessTrigger,
} from "../../database";
import { messageSmsRepository } from "../../database/services/message-sms";
import { MessageSmsSenderService } from "./message-sms-sender.service";
import { appLogger } from "../../util";

@Injectable()
export class CronSmsEndDomSenderService {
  constructor(private messageSmsSenderService: MessageSmsSenderService) {}

  @Cron(domifaConfig().cron.smsConsumer.sendEndDomCronTim)
  public async sendSmsUsagerEndDom(trigger: MonitoringBatchProcessTrigger) {
    if (!domifaConfig().cron.enable || !domifaConfig().sms.enabled) {
      // Désactiver tous les SMS en attente
      appLogger.warn(`[CronSms] Disable all SMS to Send`);
      return this.messageSmsSenderService.disableAllSmsToSend();
    }

    await monitoringBatchProcessSimpleCountRunner.monitorProcess(
      {
        processId: "sms-messages-consumer",
        trigger,
      },
      async ({ monitorTotal, monitorSuccess, monitorError }) => {
        const messageSmsList = await messageSmsRepository.findSmsEndDomToSend();

        monitorTotal(messageSmsList.length);

        for (const messageSms of messageSmsList) {
          try {
            console.log("sending sms ->");
            await this.messageSmsSenderService.sendSms(messageSms);
            monitorSuccess();
          } catch (err) {
            monitorError(err as Error);
            appLogger.warn(`[CronSms] ERROR in sending SMS : ${err?.message}`, {
              sentryBreadcrumb: true,
            });
          }
        }
      }
    );
  }
}
