import { usagerRepository } from "./../../../database/services/usager/usagerRepository.service";

import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { domifaConfig } from "../../../config";
import { setHours, setMinutes } from "date-fns";

import { appLogger } from "../../../util";
import { messageSmsRepository } from "../../../database/services/message-sms";

import { isCronEnabled } from "../../../config/services/isCronEnabled.service";
import { getPhoneString } from "../../../util/phone/phoneUtils.service";
import { PhoneNumberFormat } from "google-libphonenumber";
import { Telephone } from "../../../_common/model";
import {
  MonitoringBatchProcessTrigger,
  monitoringBatchProcessSimpleCountRunner,
} from "../../../database";
import { MessageSmsSenderService } from "../message-sms-sender.service";
import { StructureSmsParams, MessageSms, TimeZone } from "@domifa/common";

@Injectable()
export class CronSmsFetchEndDomService {
  constructor(
    private readonly messageSmsSenderService: MessageSmsSenderService
  ) {}

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Europe/Paris",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsEurope() {
    await this.fetchUsagerEndDom("Europe/Paris");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "America/Martinique",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsMartiniqueAndGuadeloupe() {
    await this.fetchUsagerEndDom("America/Guadeloupe");
    await this.fetchUsagerEndDom("America/Martinique");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "America/Cayenne",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsCayenne() {
    await this.fetchUsagerEndDom("America/Cayenne");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Indian/Mayotte",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsMayotte() {
    await this.fetchUsagerEndDom("Indian/Mayotte");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Pacific/Noumea",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsNoumea() {
    await this.fetchUsagerEndDom("Pacific/Noumea");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Pacific/Tahiti",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsTahiti() {
    await this.fetchUsagerEndDom("Pacific/Tahiti");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "America/Miquelon",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsMiquelon() {
    await this.fetchUsagerEndDom("America/Miquelon");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Indian/Maldives",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsMaldives() {
    await this.fetchUsagerEndDom("Indian/Maldives");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Indian/Reunion",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsReunion() {
    await this.fetchUsagerEndDom("Indian/Reunion");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Pacific/Wallis",
    disabled: !isCronEnabled() || !domifaConfig().sms.enabled,
  })
  protected async sendSmsWallis() {
    await this.fetchUsagerEndDom("Pacific/Wallis");
  }

  public async fetchUsagerEndDom(timeZone: TimeZone): Promise<void> {
    if (!isCronEnabled() || !domifaConfig().sms.enabled) {
      appLogger.warn(
        `[CronSms] [CronSmsFetchEndDomService] Disable all SMS to Send for ${timeZone}`
      );
      return;
    }

    appLogger.warn(
      `[CronSms] [CronSmsFetchEndDomService] Start cron in ${timeZone} at ${new Date().toString()}`
    );

    const scheduledDate = setMinutes(setHours(new Date(), 19), 0);

    const usagersWithSms: {
      structureId: number;
      ref: number;
      contactByPhone: boolean;
      telephone: Telephone;
      sms: StructureSmsParams;
    }[] = await usagerRepository.query(
      `SELECT "structureId", "ref", "contactByPhone", u."telephone", s.sms
        FROM usager u
        join structure s on s.id = u."structureId"
        WHERE decision->>'statut' = 'VALIDE'
        AND "contactByPhone" is true
        AND to_char((decision->>'dateFin')::timestamptz, 'YYYY-MM-DD') = to_char(current_date + interval '1 month' * 2, 'YYYY-MM-DD')
        and (s.sms->>'enabledByDomifa')::boolean is true and (s.sms->>'enabledByStructure')::boolean is true AND "timeZone" = $1`,
      [timeZone]
    );

    if (usagersWithSms.length === 0) {
      appLogger.warn(
        `[CronSms] [CronSmsFetchEndDomService] No structure with SMS for ${timeZone} at ${new Date().toString()}`
      );
      return;
    }

    const smsToSave: MessageSms[] = [];

    for (const usager of usagersWithSms) {
      smsToSave.push({
        usagerRef: usager.ref,
        structureId: usager.structureId,
        content: `Bonjour,\n\nVotre domiciliation expire dans 2 mois, nous vous invitons à vous rendre dans votre structure.\n\n${usager.sms.senderDetails}`,
        senderName: usager.sms.senderName,
        status: "TO_SEND",
        smsId: "echeanceDeuxMois",
        phoneNumber: getPhoneString(usager.telephone, PhoneNumberFormat.E164),
        scheduledDate,
        errorCount: 0,
      });
    }

    await messageSmsRepository.save(smsToSave);

    appLogger.warn(
      `[CronSms] [CronSmsFetchEndDomService] End cron in ${timeZone} at ${new Date().toString()}`
    );

    await this.sendSmsEcheance("cron", timeZone);
  }

  public async sendSmsEcheance(
    trigger: MonitoringBatchProcessTrigger,
    timeZone: TimeZone
  ) {
    if (!isCronEnabled() || !domifaConfig().sms.enabled) {
      appLogger.warn(
        `[CronSms] [sendSmsEcheance] SMS disabled for ${timeZone} at ${new Date().toString()}`
      );
      return;
    }

    appLogger.warn(
      `[CronSms] [sendSmsEcheance] Start sendSmsEcheance for ${timeZone} at ${new Date().toString()}`
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
      "senderName" FROM message_sms m
      join structure s on s.id = m."structureId"
      WHERE m.status = 'TO_SEND' and m."smsId" = 'echeanceDeuxMois' and
      (s.sms->>'enabledByDomifa')::boolean is true and (s.sms->>'enabledByStructure')::boolean is true AND s."timeZone"=$1`,
      [timeZone]
    );

    if (!messagesToSend || messagesToSend.length === 0) {
      appLogger.warn(
        `[CronSms] [sendSmsEcheance] No SMS to send for ${timeZone} at ${new Date().toString()}`
      );
      return;
    }

    appLogger.warn(
      `[CronSms] [sendSmsEcheance] ${
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

        for (const element of messagesToSend) {
          try {
            await this.messageSmsSenderService.sendSms(element);
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
