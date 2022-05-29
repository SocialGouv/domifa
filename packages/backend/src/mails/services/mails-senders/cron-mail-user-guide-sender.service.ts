import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import * as moment from "moment";
import { domifaConfig } from "../../../config";
import { isCronEnabled } from "../../../config/services/isCronEnabled.service";
import {
  cronMailsRepository,
  monitoringBatchProcessSimpleCountRunner,
  MonitoringBatchProcessTrigger,
} from "../../../database";
import { appLogger } from "../../../util";
import { guideUtilisateurEmailSender } from "../templates-renderers";

@Injectable()
export class CronMailUserGuideSenderService {
  @Cron(domifaConfig().cron.emailUserGuide.crontime)
  protected async sendMailGuideCron() {
    if (!isCronEnabled()) {
      appLogger.warn(`[CRON] [sendMailGuideCron] Disabled by config`);
      return;
    }
    await this.sendMailGuides("cron");
  }

  public async sendMailGuides(trigger: MonitoringBatchProcessTrigger) {
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
            guideUtilisateurEmailSender.sendMail({ user });
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
                  sentryBreadcrumb: true,
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
  const maxCreationDate: Date = moment()
    .subtract(delay.amount, delay.unit)
    .toDate();
  const minCreationDate: Date = moment(maxCreationDate)
    .subtract(14, "day")
    .toDate();
  const users = await cronMailsRepository.findUsersToSendCronMail({
    minCreationDate,
    maxCreationDate,
    structuresIds: undefined,
    mailType: "guide",
  });
  return users;
}
