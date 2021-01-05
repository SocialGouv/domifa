import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import * as moment from "moment";
import { domifaConfig } from "../../../config";
import {
  cronMailsRepository,
  MessageEmailTipimailContent,
  monitoringBatchProcessSimpleCountRunner,
  MonitoringBatchProcessTrigger,
} from "../../../database";
import { appLogger } from "../../../util";
import { AppUser } from "../../../_common/model";
import { messageEmailSender } from "../_core";

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
            await this._sendMailGuideToUser(user);
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

  private async _sendMailGuideToUser(
    user: Pick<AppUser, "id" | "email" | "nom" | "prenom">
  ) {
    const message: MessageEmailTipimailContent = {
      subject: "Le guide utilisateur Domifa",
      tipimailTemplateId: "guide-utilisateur",
      tipimailModels: [
        {
          email: user.email,
          values: {
            nom: user.prenom,
            lien: this.lienGuide,
          },
          meta: {},
        },
      ],
      to: [
        {
          address: user.email,
          personalName: user.nom + " " + user.prenom,
        },
      ],
      from: {
        personalName: "Domifa",
        address: this.domifaFromMail,
      },
      replyTo: {
        personalName: "Domifa",
        address: this.domifaAdminMail,
      },
    };

    await messageEmailSender.sendTipimailContentMessageLater(message, {
      emailId: "user-guide",
      initialScheduledDate: new Date(),
    });

    await cronMailsRepository.updateMailFlag({
      userId: user.id,
      mailType: "guide",
      value: true,
    });
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
