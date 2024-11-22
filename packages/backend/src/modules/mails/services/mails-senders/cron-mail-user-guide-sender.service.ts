import { guideUtilisateurEmailSender } from "../templates-renderers";
import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { sub, subDays } from "date-fns";
import { domifaConfig } from "../../../../config";
import { isCronEnabled } from "../../../../config/services/isCronEnabled.service";
import {
  MonitoringBatchProcessTrigger,
  monitoringBatchProcessSimpleCountRunner,
  cronMailsRepository,
} from "../../../../database";
import { appLogger } from "../../../../util";

@Injectable()
export class CronMailUserGuideSenderService {
  @Cron(domifaConfig().cron.emailUserGuide.crontime)
  protected async sendMailGuideCron() {
    if (!isCronEnabled()) {
      appLogger.warn("[CRON] [sendMailGuideCron] Disabled by config");
      return;
    }
    await this.sendMailGuides("cron");
  }

  public async sendMailGuides(trigger: MonitoringBatchProcessTrigger) {
    appLogger.warn("[CRON] [sendMailGuideCron] Start ");
    await monitoringBatchProcessSimpleCountRunner.monitorProcess(
      {
        processId: "mail-user-guide",
        trigger,
      },
      async ({ monitorTotal, monitorSuccess, monitorError }) => {
        const users = await _findUsersToSendMailGuide();
        monitorTotal(users.length);

        for (const user of users) {
          try {
            await guideUtilisateurEmailSender.sendMail({ user });
            await cronMailsRepository.updateMailFlag({
              userId: user.id,
              mailType: "guide",
              value: true,
            });
            monitorSuccess();
          } catch (err: any) {
            const totalErrors = monitorError(err);
            if (totalErrors > 10) {
              appLogger.warn(
                `[CronMailUserGuideSenderService] Too many errors: skip next users: ${err.message}`,
                {
                  sentry: true,
                }
              );
              break;
            }
          }
        }
      }
    );
  }
}
async function _findUsersToSendMailGuide() {
  const delay = domifaConfig().cron.emailUserGuide.delay;
  const maxCreationDate = sub(new Date(), {
    [delay.unit]: delay.amount,
  });

  const minCreationDate: Date = subDays(maxCreationDate, 14);
  return await cronMailsRepository.findUsersToSendCronMail({
    minCreationDate,
    maxCreationDate,
    structuresIds: undefined,
    mailType: "guide",
  });
}
