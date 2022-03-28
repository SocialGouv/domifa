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

@Injectable()
export class CronSmsFetchEndDomService {
  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTim, {
    name: "Sms send Europe/Paris",
    timeZone: "Europe/Paris",
  })
  protected async sendSmsEurope() {
    await this.fetchUsagerEndDom("cron", "Europe/Paris");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTim, {
    name: "Sms send America/Martinique",
    timeZone: "America/Martinique",
  })
  protected async sendSmsMartinique() {
    await this.fetchUsagerEndDom("cron", "America/Martinique");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTim, {
    name: "Sms send America/Cayenne",
    timeZone: "America/Cayenne",
  })
  protected async sendSmsCayenne() {
    await this.fetchUsagerEndDom("cron", "America/Cayenne");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTim, {
    name: "Sms send Indian/Mayotte",
    timeZone: "Indian/Mayotte",
  })
  protected async sendSmsMayotte() {
    await this.fetchUsagerEndDom("cron", "Indian/Mayotte");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTim, {
    name: "Sms send Pacific/Noumea",
    timeZone: "Pacific/Noumea",
  })
  protected async sendSmsNoumea() {
    await this.fetchUsagerEndDom("cron", "Pacific/Noumea");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTim, {
    name: "Sms send Pacific/Tahiti",
    timeZone: "Pacific/Tahiti",
  })
  protected async sendSmsTahiti() {
    await this.fetchUsagerEndDom("cron", "Pacific/Tahiti");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTim, {
    name: "Sms send America/Miquelon",
    timeZone: "America/Miquelon",
  })
  protected async sendSmsMiquelon() {
    await this.fetchUsagerEndDom("cron", "America/Miquelon");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTim, {
    name: "Sms send Indian/Maldives",
    timeZone: "Indian/Maldives",
  })
  protected async sendSmsMaldives() {
    await this.fetchUsagerEndDom("cron", "Indian/Maldives");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTim, {
    name: "Sms send Indian/Reunion",
    timeZone: "Indian/Reunion",
  })
  protected async sendSmsReunion() {
    await this.fetchUsagerEndDom("cron", "Indian/Reunion");
  }

  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTim)
  public async fetchUsagerEndDom(
    trigger: MonitoringBatchProcessTrigger,
    timeZone: TimeZone
  ) {
    const structuresWithSms = await structureRepository.getStructureWithSms(
      timeZone,
      ["id", "sms"]
    );

    if (!structuresWithSms || structuresWithSms.length === 0) {
      appLogger.warn(
        `[CronSms] No structure with SMS for ${timeZone} at ${new Date().toString()}`
      );
      return;
    }
    // Si désactivé, on retire tous les SMS en attente
    if (!domifaConfig().cron.enable || !domifaConfig().sms.enabled) {
      appLogger.warn(`[CronSms] Disable all SMS to Send`);
      return;
    }

    const scheduledDate = new Date();
    scheduledDate.setUTCHours(19, 0, 0);

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
        `[SMS-REMINDER-GEN] [${structure.id}] ${usagersWithSms.length} usagers à prévenir par SMS`
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
  }
}
