import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

import { domifaConfig } from "../../config";
import { MonitoringBatchProcessTrigger } from "../../database";

import { MessageSms } from "../../_common/model/message-sms";
@Injectable()
export class CronSmsImportGuideSenderService {
  constructor() {}

  @Cron(domifaConfig().cron.smsConsumer.crontime)
  protected async sendSmsImportCron() {
    if (!domifaConfig().cron.enable) {
      return;
    }
    await this.sendSmsImports("cron");
  }

  public async sendSmsImports(trigger: MonitoringBatchProcessTrigger) {
    // 1. Get On Hold SMS < NOW
    // 2. Parcours des sms
    // 3. Envoi
    // 4. Catch de la réponse
    /*
    for (const user of users) {
      try {
        await guideImportEmailSender.sendSms({ user });

        await cronSmssRepository.updateSmsFlag({
          userId: user.id,
          mailType: "import",
          value: true,
        });
        monitorSuccess();
      } catch (err) {
        const totalErrors = monitorError(err);
        if (totalErrors > 10) {
          appLogger.warn(
            `[CronSmsImportGuideSenderService] Too many errors: skip next users: : ${err.message}`,
            {
              sentryBreadcrumb: true,
            }
          );
          break;
        }
      }
    }*/
  }

  private async _findSmsToSend(): Promise<MessageSms[]> {
    return [];
  }
}
