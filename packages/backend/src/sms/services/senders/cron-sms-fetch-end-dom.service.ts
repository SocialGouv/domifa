import { usagerLightRepository } from "../../../database/services/usager/usagerLightRepository.service";
import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { domifaConfig } from "../../../config";
import { setHours, setMinutes } from "date-fns";

import { appLogger } from "../../../util";
import { messageSmsRepository } from "../../../database/services/message-sms";
import { structureRepository } from "../../../database";
import { TimeZone } from "../../../util/territoires";
import { isCronEnabled } from "../../../config/services/isCronEnabled.service";
import { getPhoneString } from "../../../util/phone/phoneUtils.service";

@Injectable()
export class CronSmsFetchEndDomService {
  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Europe/Paris",
  })
  protected async sendSmsEurope() {
    await this.fetchUsagerEndDom("Europe/Paris");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "America/Martinique",
  })
  protected async sendSmsMartiniqueAndGuadeloupe() {
    await this.fetchUsagerEndDom("America/Guadeloupe");
    await this.fetchUsagerEndDom("America/Martinique");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "America/Cayenne",
  })
  protected async sendSmsCayenne() {
    await this.fetchUsagerEndDom("America/Cayenne");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Indian/Mayotte",
  })
  protected async sendSmsMayotte() {
    await this.fetchUsagerEndDom("Indian/Mayotte");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Pacific/Noumea",
  })
  protected async sendSmsNoumea() {
    await this.fetchUsagerEndDom("Pacific/Noumea");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Pacific/Tahiti",
  })
  protected async sendSmsTahiti() {
    await this.fetchUsagerEndDom("Pacific/Tahiti");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "America/Miquelon",
  })
  protected async sendSmsMiquelon() {
    await this.fetchUsagerEndDom("America/Miquelon");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Indian/Maldives",
  })
  protected async sendSmsMaldives() {
    await this.fetchUsagerEndDom("Indian/Maldives");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Indian/Reunion",
  })
  protected async sendSmsReunion() {
    await this.fetchUsagerEndDom("Indian/Reunion");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTime, {
    timeZone: "Pacific/Wallis",
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
        select: ["structureId", "ref", "contactByPhone", "telephone"],
        where: `decision->>'statut' = 'VALIDE'
                AND "structureId" = :structureId
                AND "contactByPhone" is true
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
          content: `Bonjour,\n\nVotre domiciliation expire dans 2 mois, nous vous invitons à vous rendre dans votre structure.\n\n${structure.sms.senderDetails}`,
          smsId: "echeanceDeuxMois",
          status: "TO_SEND",
          errorCount: 0,
          scheduledDate,
          phoneNumber: getPhoneString(usager.telephone),
          senderName: structure.sms.senderName,
        });
      }
      return;
    }
    return;
  }
}
