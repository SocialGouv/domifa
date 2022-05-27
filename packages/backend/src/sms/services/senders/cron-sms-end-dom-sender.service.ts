import { TimeZone } from "./../../../util/territoires/types/TimeZone.type";
import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";

import { domifaConfig } from "../../../config";
import {
  monitoringBatchProcessSimpleCountRunner,
  MonitoringBatchProcessTrigger,
  structureRepository,
} from "../../../database";
import { messageSmsRepository } from "../../../database/services/message-sms";
import { MessageSmsSenderService } from "../message-sms-sender.service";
import { appLogger } from "../../../util";
import { isCronEnabled } from "../../../config/services/isCronEnabled.service";

@Injectable()
export class CronSmsEndDomSenderService {
  constructor(private messageSmsSenderService: MessageSmsSenderService) {}

  @Cron(domifaConfig().cron.smsConsumer.sendEndDomCronTime, {
    timeZone: "Europe/Paris",
  })
  protected async sendSmsEurope() {
    await this.sendSmsUsagerEndDom("cron", "Europe/Paris");
  }

  @Cron(domifaConfig().cron.smsConsumer.sendEndDomCronTime, {
    timeZone: "America/Martinique",
  })
  protected async sendSmsMartinique() {
    await this.sendSmsUsagerEndDom("cron", "America/Martinique");
  }

  @Cron(domifaConfig().cron.smsConsumer.sendEndDomCronTime, {
    timeZone: "America/Cayenne",
  })
  protected async sendSmsCayenne() {
    await this.sendSmsUsagerEndDom("cron", "America/Cayenne");
  }

  @Cron(domifaConfig().cron.smsConsumer.sendEndDomCronTime, {
    timeZone: "Indian/Mayotte",
  })
  protected async sendSmsMayotte() {
    await this.sendSmsUsagerEndDom("cron", "Indian/Mayotte");
  }

  @Cron(domifaConfig().cron.smsConsumer.sendEndDomCronTime, {
    timeZone: "Pacific/Noumea",
  })
  protected async sendSmsNoumea() {
    await this.sendSmsUsagerEndDom("cron", "Pacific/Noumea");
  }

  @Cron(domifaConfig().cron.smsConsumer.sendEndDomCronTime, {
    timeZone: "Pacific/Tahiti",
  })
  protected async sendSmsTahiti() {
    await this.sendSmsUsagerEndDom("cron", "Pacific/Tahiti");
  }

  @Cron(domifaConfig().cron.smsConsumer.sendEndDomCronTime, {
    timeZone: "America/Miquelon",
  })
  protected async sendSmsMiquelon() {
    await this.sendSmsUsagerEndDom("cron", "America/Miquelon");
  }

  @Cron(domifaConfig().cron.smsConsumer.sendEndDomCronTime, {
    timeZone: "Indian/Maldives",
  })
  protected async sendSmsMaldives() {
    await this.sendSmsUsagerEndDom("cron", "Indian/Maldives");
  }

  @Cron(domifaConfig().cron.smsConsumer.sendEndDomCronTime, {
    timeZone: "Pacific/Wallis",
  })
  protected async sendSmsWallis() {
    await this.sendSmsUsagerEndDom("cron", "Pacific/Wallis");
  }

  @Cron(domifaConfig().cron.smsConsumer.sendEndDomCronTime, {
    timeZone: "Indian/Reunion",
  })
  protected async sendSmsReunion() {
    await this.sendSmsUsagerEndDom("cron", "Indian/Reunion");
  }

  public async sendSmsUsagerEndDom(
    trigger: MonitoringBatchProcessTrigger,
    timeZone: TimeZone
  ) {
    if (!isCronEnabled() || !domifaConfig().sms.enabled) {
      appLogger.warn(`[CronSms] [sendSmsUsagerEndDom] Disable all SMS to Send`);
      return;
    }

    const structureIds = await structureRepository.getStructureIdsWithSms(
      timeZone
    );

    if (!structureIds || structureIds.length === 0) {
      appLogger.warn(
        `[CronSms] [sendSmsUsagerEndDom] No structure with SMS for ${timeZone} at ${new Date().toString()}`
      );
      return;
    }

    await monitoringBatchProcessSimpleCountRunner.monitorProcess(
      {
        processId: "sms-messages-consumer",
        trigger,
      },
      async ({ monitorTotal, monitorSuccess, monitorError }) => {
        const messageSmsList = await messageSmsRepository.findSmsEndDomToSend(
          structureIds
        );

        monitorTotal(messageSmsList.length);

        for (const messageSms of messageSmsList) {
          try {
            await this.messageSmsSenderService.sendSms(messageSms);
            monitorSuccess();
          } catch (err) {
            monitorError(err as Error);
            appLogger.warn(
              `[CronSms] ERROR in sending SMS : ${JSON.stringify(err)}`,
              {
                sentryBreadcrumb: true,
              }
            );
          }
        }
      }
    );
  }
}
