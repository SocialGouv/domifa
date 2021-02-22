import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import * as moment from "moment";
import { domifaConfig } from "../../../config";
import {
  cronMailsRepository,
  monitoringBatchProcessSimpleCountRunner,
  MonitoringBatchProcessTrigger,
  structureRepository,
} from "../../../database";
import { Structure } from "../../../structures/structure-interface";
import { appLogger } from "../../../util";
import { guideImportEmailSender } from "../templates-renderers";

@Injectable()
export class CronMailImportGuideSenderService {
  private lienImport: string;
  private lienFaq: string;
  private lienGuide: string;
  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor() {
    this.lienImport = domifaConfig().apps.frontendUrl + "import";
    this.lienFaq = domifaConfig().apps.frontendUrl + "faq";
    this.lienGuide =
      domifaConfig().apps.frontendUrl +
      "assets/files/guide_utilisateur_domifa.pdf";
    this.domifaAdminMail = domifaConfig().email.emailAddressAdmin;
    this.domifaFromMail = domifaConfig().email.emailAddressFrom;
  }

  @Cron(domifaConfig().cron.emailImportGuide.crontime)
  protected async sendMailImportCron() {
    if (!domifaConfig().cron.enable) {
      return;
    }

    await this.sendMailImports("cron");
  }

  public async sendMailImports(trigger: MonitoringBatchProcessTrigger) {
    await monitoringBatchProcessSimpleCountRunner.monitorProcess(
      {
        processId: "mail-import-guide",
        trigger,
      },
      async ({ monitorTotal, monitorSuccess, monitorError }) => {
        const users = await this._findUsersToSendImportGuide();
        monitorTotal(users.length);

        for (const user of users) {
          try {
            await guideImportEmailSender.sendMail({ user });

            await cronMailsRepository.updateMailFlag({
              userId: user.id,
              mailType: "import",
              value: true,
            });
            monitorSuccess();
          } catch (err) {
            const totalErrors = monitorError(err);
            if (totalErrors > 10) {
              appLogger.warn(
                `[CronMailImportGuideSenderService] Too many errors: skip next users: : ${err.message}`,
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

  private async _findUsersToSendImportGuide() {
    const delay = domifaConfig().cron.emailImportGuide.delay;
    const maxCreationDate: Date = moment()
      .utc()
      .subtract(delay.amount, delay.unit)
      .endOf("day")
      .toDate();

    const structuresIds: number[] = [];

    const structures: Pick<
      Structure,
      "id"
    >[] = await structureRepository.findMany(
      {
        import: false,
      },
      {
        select: ["id"],
      }
    );

    if (structures.length === 0) {
      return [];
    }
    for (const structure of structures) {
      structuresIds.push(structure.id);
    }

    if (structuresIds.length === 0) {
      return;
    }

    const users = await cronMailsRepository.findUsersToSendCronMail({
      maxCreationDate,
      structuresIds,
      mailType: "import",
    });

    return users;
  }
}
