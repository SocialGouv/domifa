import { usagerLightRepository } from "../../../database/services/usager/usagerLightRepository.service";
import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { domifaConfig } from "../../../config";

import { appLogger } from "../../../util";
import { messageSmsRepository } from "../../../database/services/message-sms";
import {
  MonitoringBatchProcessTrigger,
  structureRepository,
} from "../../../database";
import { TimeZone } from "../../../util/territoires";
import { setHours, setMinutes } from "date-fns";
import { isCronEnabled } from "../../../config/services/isCronEnabled.service";

@Injectable()
export class CronSmsFetchEndDomService {
  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Europe/Paris",
  })
  protected async sendSmsEurope() {
    await this.fetchUsagerEndDom("cron", "Europe/Paris");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "America/Martinique",
  })
  protected async sendSmsMartinique() {
    await this.fetchUsagerEndDom("cron", "America/Martinique");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "America/Cayenne",
  })
  protected async sendSmsCayenne() {
    await this.fetchUsagerEndDom("cron", "America/Cayenne");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Indian/Mayotte",
  })
  protected async sendSmsMayotte() {
    await this.fetchUsagerEndDom("cron", "Indian/Mayotte");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Pacific/Noumea",
  })
  protected async sendSmsNoumea() {
    await this.fetchUsagerEndDom("cron", "Pacific/Noumea");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Pacific/Tahiti",
  })
  protected async sendSmsTahiti() {
    await this.fetchUsagerEndDom("cron", "Pacific/Tahiti");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "America/Miquelon",
  })
  protected async sendSmsMiquelon() {
    await this.fetchUsagerEndDom("cron", "America/Miquelon");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Indian/Maldives",
  })
  protected async sendSmsMaldives() {
    await this.fetchUsagerEndDom("cron", "Indian/Maldives");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Indian/Reunion",
  })
  protected async sendSmsReunion() {
    await this.fetchUsagerEndDom("cron", "Indian/Reunion");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Pacific/Wallis",
  })
  protected async sendSmsWallis() {
    await this.fetchUsagerEndDom("cron", "Pacific/Wallis");
  }

  public async fetchUsagerEndDom(
    trigger: MonitoringBatchProcessTrigger,
    timeZone: TimeZone
  ) {
    if (!isCronEnabled() || !domifaConfig().sms.enabled) {
      appLogger.warn(
        `[CronSms] [CronSmsFetchEndDomService] Disable all SMS to Send for ${timeZone}`
      );
      return;
    }

    appLogger.warn(
      `[CronSms] [CronSmsFetchEndDomService] Start cron in ${timeZone} at ${new Date().toString()}`
    );

    const structuresWithSms = await structureRepository.getStructureWithSms(
      timeZone,
      ["id", "sms"]
    );

    if (!structuresWithSms || structuresWithSms.length === 0) {
      appLogger.warn(
        `[CronSms] [CronSmsFetchEndDomService] No structure with SMS for ${timeZone} at ${new Date().toString()}`
      );
      return;
    }

    const scheduledDate = setMinutes(setHours(new Date(), 19), 0);

    appLogger.debug(
      `[SMS-REMINDER-GEN] ${structuresWithSms.length} structures avec SMS actif`
    );

    for (const structure of structuresWithSms) {
      const usagersWithSms = await usagerLightRepository.findManyWithQuery({
        select: ["structureId", "ref", "preference"],
        where: `decision->>'statut' = 'VALIDE'
                AND "structureId" = :structureId
                AND (preference->>'phone')::boolean is true
                AND to_char((decision->>'dateFin')::timestamptz, 'YYYY-MM-DD') = to_char(current_date + interval '1 month' * 2, 'YYYY-MM-DD')`,
        params: {
          structureId: structure.id,
        },
      });

      if (usagersWithSms.length === 0) {
        continue;
      }

      appLogger.debug(
        `[CronSms] [CronSmsFetchEndDomService] [${structure.id}] ${usagersWithSms.length} usagers à prévenir par SMS`
      );

      for (const usager of usagersWithSms) {
        await messageSmsRepository.upsertEndDom({
          usagerRef: usager.ref,
          structureId: usager.structureId,
          content: `Bonjour, \n\nVotre domiciliation expire dans 2 mois, nous vous invitons à vous rendre dans votre structure.\n\n${structure.sms.senderDetails}`,
          smsId: "echeanceDeuxMois",
          status: "TO_SEND",
          errorCount: 0,
          scheduledDate,
          phoneNumber: usager.preference.phoneNumber,
          senderName: structure.sms.senderName,
        });
      }
    }
    return true;
  }
}
