import { TimeZone } from "./../../../util/territoires/types/TimeZone.type";
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
import { isCronEnabled } from "../../../config/services/isCronEnabled.service";

@Injectable()
export class CronSmsInteractionSenderService {
  constructor(private messageSmsSenderService: MessageSmsSenderService) {}

  @Cron(domifaConfig().cron.smsConsumer.crontime, {
    timeZone: "Europe/Paris",
  })
  protected async sendSmsEurope() {
    await this.sendSmsInteraction("cron", "Europe/Paris");
  }

  @Cron(domifaConfig().cron.smsConsumer.crontime, {
    timeZone: "America/Martinique",
  })
  protected async sendSmsMartiniqueAndGuadeloupe() {
    await this.sendSmsInteraction("cron", "America/Martinique");
    await this.sendSmsInteraction("cron", "America/Guadeloupe");
  }

  @Cron(domifaConfig().cron.smsConsumer.crontime, {
    timeZone: "America/Cayenne",
  })
  protected async sendSmsCayenne() {
    await this.sendSmsInteraction("cron", "America/Cayenne");
  }

  @Cron(domifaConfig().cron.smsConsumer.crontime, {
    timeZone: "Indian/Mayotte",
  })
  protected async sendSmsMayotte() {
    await this.sendSmsInteraction("cron", "Indian/Mayotte");
  }

  @Cron(domifaConfig().cron.smsConsumer.crontime, {
    timeZone: "Pacific/Noumea",
  })
  protected async sendSmsNoumea() {
    await this.sendSmsInteraction("cron", "Pacific/Noumea");
  }

  @Cron(domifaConfig().cron.smsConsumer.crontime, {
    timeZone: "Pacific/Tahiti",
  })
  protected async sendSmsTahiti() {
    await this.sendSmsInteraction("cron", "Pacific/Tahiti");
  }
  @Cron(domifaConfig().cron.smsConsumer.crontime, {
    timeZone: "America/Miquelon",
  })
  protected async sendSmsMiquelon() {
    await this.sendSmsInteraction("cron", "America/Miquelon");
  }

  @Cron(domifaConfig().cron.smsConsumer.crontime, {
    timeZone: "Indian/Maldives",
  })
  protected async sendSmsMaldives() {
    await this.sendSmsInteraction("cron", "Indian/Maldives");
  }
  @Cron(domifaConfig().cron.smsConsumer.crontime, {
    timeZone: "Pacific/Wallis",
  })
  protected async sendSmsWallis() {
    await this.sendSmsInteraction("cron", "Pacific/Wallis");
  }

  @Cron(domifaConfig().cron.smsConsumer.crontime, {
    timeZone: "Indian/Reunion",
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
      WHERE m.status = 'TO_SEND' and m."smsId" != 'echeanceDeuxMois' and
      (s.sms->>'enabledByDomifa')::boolean is true and (s.sms->>'enabledByStructure')::boolean is true AND s."timeZone"=$1`,
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
