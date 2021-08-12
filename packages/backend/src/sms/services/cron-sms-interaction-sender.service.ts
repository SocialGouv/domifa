import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
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

  @Cron(CronExpression.EVERY_10_SECONDS)
  protected async sendSmsImportCron() {
    if (!domifaConfig().cron.enable || !domifaConfig().sms.enabled) {
      // Désactiver tous les SMS en attente
      appLogger.warn(`[CronSms] Disable all SMS to Send`);
      return this.messageSmsSenderService.disableAllSmsToSend();
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
          try {
            await this.messageSmsSenderService.sendSms(messageSms);
            monitorSuccess();
          } catch (err) {
            monitorError(err);
            appLogger.warn(`[CronSms] ERROR in sending SMS : ${err?.message}`, {
              sentryBreadcrumb: true,
            });
          }
        }
      }
    );
  }
}
