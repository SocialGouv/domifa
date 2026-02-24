import { appLogger } from "../../../../util";
import { messageSmsRepository } from "../../../../database";

import { Cron, CronExpression } from "@nestjs/schedule";
import { Injectable } from "@nestjs/common";
import { domifaConfig } from "../../../../config";
import { isCronEnabled } from "../../../../config/services/isCronEnabled.service";
import { MessageSmsSenderService } from "../message-sms-sender.service";
import { SmsToSend } from "../../types";
import { SentryCron } from "@sentry/nestjs";

@Injectable()
export class CronSmsMonDomiFaService {
  constructor(
    private readonly messageSmsSenderService: MessageSmsSenderService
  ) {}

  @Cron(CronExpression.EVERY_HOUR, {
    timeZone: "Europe/Paris",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  @SentryCron("sms-mon-domifa-batch", {
    schedule: {
      type: "crontab",
      value: CronExpression.EVERY_HOUR,
    },
    timezone: "Europe/Paris",
    checkinMargin: 10,
    maxRuntime: 50,
  })
  protected async processSMSBatch() {
    appLogger.info("[SMS BATCH] Début d'envoi d'un batch de 500 SMS");

    try {
      const now = new Date();
      const currentHour = now.getHours();

      if (currentHour >= 23) {
        appLogger.info(
          `[SMS BATCH] Hors plage horaire (${currentHour}h) - Arrêt de l'envoi`
        );
        return;
      }

      const smsToSend = await messageSmsRepository.find({
        where: {
          status: "TO_SEND",
          smsId: "idMonDomiFa",
        },
        take: 200,
      });

      if (smsToSend.length === 0) {
        appLogger.info(
          "[SMS BATCH] Aucun SMS d'identifiants Mon DomiFa à envoyer"
        );
        return;
      }

      appLogger.info(
        `[SMS BATCH] ${smsToSend.length} SMS d'identifiants Mon DomiFa trouvés pour envoi`
      );

      for (const message of smsToSend) {
        await this.messageSmsSenderService.sendSms(message as SmsToSend);
      }

      appLogger.info(
        `[SMS BATCH] Batch terminé - ${smsToSend.length} SMS traités`
      );
    } catch (error) {
      console.log(error);
      appLogger.error("[SMS BATCH] Erreur lors de l'envoi du batch:", error);
    }
  }
}
