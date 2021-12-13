import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { domifaConfig } from "../../config";

import { appLogger } from "../../util";
import { usagerRepository } from "./../../database/services/usager/usagerRepository.service";
import { messageSmsRepository } from "../../database/services/message-sms";

@Injectable()
export class CronSmsFetchEndDomService {
  @Cron(domifaConfig().cron.smsConsumer.fetchEndDomCronTim)
  public async fetchUsagerEndDom() {
    console.log("toto : ", domifaConfig().cron.smsConsumer.fetchEndDomCronTim);
    if (!domifaConfig().cron.enable || !domifaConfig().sms.enabled) {
      appLogger.warn(`[CronSms] Disable fetch usager end dom`);
      return;
    }

    const usagers = await usagerRepository.searchUsagersByEndDom();

    for (const usager of usagers) {
      await messageSmsRepository.upsertEndDom({
        usagerRef: usager.ref,
        structureId: usager.structureId,
        content: `Bonjour, \n\nVotre domiciliation expire dans 2 mois, nous vous invitons à vous rendre dans votre structure.\n\n${usager.senderDetails}`,
        smsId: "echeanceDeuxMois",
        status: "TO_SEND",
        responseId: "",
        scheduledDate: new Date(),
        phoneNumber: usager.phone,
        senderName: usager.nom,
      });
    }
  }
}
