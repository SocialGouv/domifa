import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

import { TimeZone } from "@domifa/common";
import { format } from "date-fns";
import { domifaConfig } from "../../../../config";
import { isCronEnabled } from "../../../../config/services/isCronEnabled.service";
import {
  MonitoringBatchProcessTrigger,
  messageSmsRepository,
  monitoringBatchProcessSimpleCountRunner,
} from "../../../../database";
import { appLogger } from "../../../../util";
import { MessageSmsSenderService } from "../message-sms-sender.service";

// Cron: du lundi au vendredi à 19h00
const WEEKDAY_AT_7PM = "0 19 * * 1-5";

@Injectable()
export class CronSmsInteractionSenderService {
  constructor(
    private readonly messageSmsSenderService: MessageSmsSenderService
  ) {}

  @Cron(WEEKDAY_AT_7PM, {
    timeZone: "Europe/Paris",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsEurope() {
    await this.sendSmsInteraction("cron", "Europe/Paris");
  }

  @Cron(WEEKDAY_AT_7PM, {
    timeZone: "America/Martinique",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsMartiniqueAndGuadeloupe() {
    await this.sendSmsInteraction("cron", "America/Martinique");
    await this.sendSmsInteraction("cron", "America/Guadeloupe");
  }

  @Cron(WEEKDAY_AT_7PM, {
    timeZone: "America/Cayenne",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsCayenne() {
    await this.sendSmsInteraction("cron", "America/Cayenne");
  }

  @Cron(WEEKDAY_AT_7PM, {
    timeZone: "Indian/Mayotte",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsMayotte() {
    await this.sendSmsInteraction("cron", "Indian/Mayotte");
  }

  @Cron(WEEKDAY_AT_7PM, {
    timeZone: "Pacific/Noumea",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsNoumea() {
    await this.sendSmsInteraction("cron", "Pacific/Noumea");
  }

  @Cron(WEEKDAY_AT_7PM, {
    timeZone: "Pacific/Tahiti",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsTahiti() {
    await this.sendSmsInteraction("cron", "Pacific/Tahiti");
  }
  @Cron(WEEKDAY_AT_7PM, {
    timeZone: "America/Miquelon",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsMiquelon() {
    await this.sendSmsInteraction("cron", "America/Miquelon");
  }

  @Cron(WEEKDAY_AT_7PM, {
    timeZone: "Indian/Maldives",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsMaldives() {
    await this.sendSmsInteraction("cron", "Indian/Maldives");
  }
  @Cron(WEEKDAY_AT_7PM, {
    timeZone: "Pacific/Wallis",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsWallis() {
    await this.sendSmsInteraction("cron", "Pacific/Wallis");
  }

  @Cron(WEEKDAY_AT_7PM, {
    timeZone: "Indian/Reunion",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsReunion() {
    await this.sendSmsInteraction("cron", "Indian/Reunion");
  }

  public async sendSmsInteraction(
    trigger: MonitoringBatchProcessTrigger,
    timeZone: TimeZone
  ) {
    if (!isCronEnabled() || !domifaConfig().sms.enabled) {
      appLogger.warn(
        `[CronSms] [sendSmsInteraction] SMS disabled for ${timeZone} at ${new Date().toString()}`
      );
      return;
    }

    appLogger.warn(
      `[CronSms] [sendSmsInteraction] Start sendSmsInteraction for ${timeZone} at ${new Date().toString()}`
    );

    const day = format(new Date(), "EEEE").toLowerCase();

    const messagesToSend: {
      content: string;
      phoneNumber: string;
      senderName: string;
      structureId: number;
      uuid: string;
      errorCount: number;
    }[] = await messageSmsRepository.query(
      `SELECT
       m."uuid",
      "errorCount",
      "structureId",
      "content",
      "phoneNumber",
      "senderName"
      FROM message_sms m
      join structure s on s.id = m."structureId"
      WHERE m.status = 'TO_SEND' and m."smsId" != 'echeanceDeuxMois'
      and (s.sms->>'enabledByDomifa')::boolean is true
      and (s.sms->>'enabledByStructure')::boolean is true
      AND s."timeZone"=$1
      AND (s.sms->'schedule'->>'${day}')::boolean is true`,
      [timeZone]
    );

    if (!messagesToSend || messagesToSend.length === 0) {
      appLogger.warn(
        `[CronSms] [sendSmsInteraction] No SMS to send for ${timeZone} at ${new Date().toString()}`
      );
      return;
    }

    appLogger.warn(
      `[CronSms] [sendSmsInteraction] ${
        messagesToSend.length
      } SMS to send enabled for ${timeZone} at ${new Date().toString()}`
    );

    await monitoringBatchProcessSimpleCountRunner.monitorProcess(
      {
        processId: "sms-messages-consumer",
        trigger,
      },
      async ({ monitorTotal, monitorSuccess, monitorError }) => {
        monitorTotal(messagesToSend.length);

        for (let i = 0; i < messagesToSend.length; i++) {
          // Mesure de prévention pour ne pas surcharger l'API
          if (i % 300 === 0) {
            setTimeout(() => {
              appLogger.warn(`[CronSms] ... Wait 10 seconds`);
            }, 10000);
          }

          try {
            await this.messageSmsSenderService.sendSms(messagesToSend[i]);
            monitorSuccess();
          } catch (err) {
            monitorError(err as Error);
            appLogger.warn(
              `[CronSms] ERROR in sending SMS : ${JSON.stringify(err)}`,
              {
                sentry: true,
              }
            );
          }
        }
      }
    );
  }
}
