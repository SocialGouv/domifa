import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { domifaConfig } from "../../../config";
import {
  MonitoringBatchProcessTrigger,
  monitoringBatchProcessSimpleCountRunner,
} from "../../../database";
import { messageSmsRepository } from "../../../database/services/message-sms";
import { appLogger } from "../../../util";
import { MessageSmsSenderService } from "../message-sms-sender.service";

@Injectable()
export class CronSmsInteractionSenderService {
  constructor(private messageSmsSenderService: MessageSmsSenderService) {}

  @Cron(domifaConfig().cron.smsConsumer.crontime)
  protected async sendSmsInteractionCron() {
    if (!domifaConfig().cron.enable || !domifaConfig().sms.enabled) {
      // Désactiver tous les SMS en attente
      appLogger.warn(`[CronSms] Disable all SMS to Send`);
      return this.messageSmsSenderService.disableAllSmsToSend();
    }
    await this.sendSmsInteraction("cron");
  }

  public async sendSmsInteraction(trigger: MonitoringBatchProcessTrigger) {
    await monitoringBatchProcessSimpleCountRunner.monitorProcess(
      {
        processId: "sms-messages-consumer",
        trigger,
      },
      async ({ monitorTotal, monitorSuccess, monitorError }) => {
        const messageSmsList =
          await messageSmsRepository.findInteractionSmsToSend();

        monitorTotal(messageSmsList.length);

        for (const messageSms of messageSmsList) {
          try {
            await this.messageSmsSenderService.sendSms(messageSms);
            monitorSuccess();
          } catch (err) {
            monitorError(err as Error);
            appLogger.warn(
              `[CronSms] ERROR in sending SMS : ${JSON.stringify(err)}`,
              {
                sentryBreadcrumb: true,
              }
            );
          }
        }
      }
    );
  }
}
