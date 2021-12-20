import { usagerLightRepository } from "./../../database/services/usager/usagerLightRepository.service";
import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { domifaConfig } from "../../config";

import { appLogger } from "../../util";
import { messageSmsRepository } from "../../database/services/message-sms";
import { structureCommonRepository } from "../../database";

@Injectable()
export class CronSmsFetchEndDomService {
  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTim)
  public async fetchUsagerEndDom() {
    if (!domifaConfig().cron.enable || !domifaConfig().sms.enabled) {
      appLogger.warn(`[CronSms] Disable fetch usager end dom`);
      return;
    }

    // Liste des structures accessibles
    const structuresWithSms = await structureCommonRepository.findManyWithQuery(
      {
        where: `(sms->>'enabledByDomifa')::boolean is true and (sms->>'enabledByStructure')::boolean is true`,
        select: ["id", "sms"],
      }
    );

    // Date du jour à 19h
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
