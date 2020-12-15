import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import * as moment from "moment";
import { domifaConfig } from "../../config";
import { cronMailsRepository, MessageEmailContent } from "../../database";
import { MonitoringBatchProcessTrigger } from "../../database/entities/monitoring";
import { monitoringBatchProcessSimpleCountRunner } from "../../database/services/monitoring/simple-count";
import { appLogger } from "../../util";
import { AppUser } from "../../_common/model";
import { MessageEmailSender } from "./message-email-sender.service";

@Injectable()
export class CronMailUserGuideSenderService {
  private lienGuide: string;
  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor(private messageEmailSender: MessageEmailSender) {
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
    const message: MessageEmailContent = {
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

    await this.messageEmailSender.sendMailLater(message, {
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
