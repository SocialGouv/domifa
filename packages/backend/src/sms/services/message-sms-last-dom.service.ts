import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

import {
  monitoringBatchProcessSimpleCountRunner,
  MonitoringBatchProcessTrigger,
} from "../../database";
import { usagerRepository } from "./../../database/services/usager/usagerRepository.service";
import { messageSmsRepository } from "../../database/services/message-sms";
import { MessageSmsSenderService } from "./message-sms-sender.service";
import { appLogger } from "../../util";

@Injectable()
export class CronSmsNotificationEndDomService {
  constructor(private messageSmsSenderService: MessageSmsSenderService) {}

  @Cron("0 * * * * *")
  public async fetchUsagerEndDom() {
    const usagers = await usagerRepository.searchUsagersByEndDom();

    for (const usager of usagers) {
      await messageSmsRepository.upsertEndDom({
        usagerRef: usager.ref,
        structureId: usager.structureId,
        content:
          "Bonjour, \n\nVotre domiciliation expire dans 2 mois, nous vous invitons à vous rendre dans votre structure.",
        smsId: "echeanceDeuxMois",
        status: "TO_SEND",
        responseId: "",
        scheduledDate: new Date(),
        phoneNumber: usager.phone,
        senderName: usager.nom,
      });
    }
  }

  @Cron("0 5 * * * *")
  public async sendSmsUsagerEndDom(trigger: MonitoringBatchProcessTrigger) {
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
