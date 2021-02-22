import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import * as moment from "moment";
import { domifaConfig } from "../../../config";
import {
  cronMailsRepository,
  monitoringBatchProcessSimpleCountRunner,
  MonitoringBatchProcessTrigger,
} from "../../../database";
import { appLogger } from "../../../util";
import { guideUtilisateurEmailSender } from "../templates-renderers";

@Injectable()
export class CronMailUserGuideSenderService {
  private lienGuide: string;
  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor() {
    this.lienGuide =
      domifaConfig().apps.frontendUrl +
      "assets/files/guide_utilisateur_domifa.pdf";

    this.domifaAdminMail = domifaConfig().email.emailAddressAdmin;
    this.domifaFromMail = domifaConfig().email.emailAddressFrom;
  }

  @Cron(domifaConfig().cron.emailUserGuide.crontime)
  protected async sendMailGuideCron() {
    if (!domifaConfig().cron.enable) {
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
          } catch (err) {
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
    .utc()
    .subtract(delay.amount, delay.unit)
    .endOf("day")
    .toDate();

  const users = await cronMailsRepository.findUsersToSendCronMail({
    maxCreationDate,
    structuresIds: undefined,
    mailType: "guide",
  });
  return users;
}
