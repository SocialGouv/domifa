import { Inject, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import * as moment from "moment";
import { Model } from "mongoose";
import { domifaConfig } from "../../config";
import { cronMailsRepository } from "../../database";
import { MonitoringBatchProcessTrigger } from "../../database/entities/monitoring";
import { monitoringBatchProcessSimpleCountRunner } from "../../database/services/monitoring/simple-count";
import { Structure } from "../../structures/structure-interface";
import { appLogger } from "../../util";
import { AppUser } from "../../_common/model";
import { TipimailMessage, TipimailSender } from "./tipimail-sender.service";

@Injectable()
export class CronMailImportGuideSenderService {
  private lienImport: string;
  private lienFaq: string;
  private lienGuide: string;
  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor(
    private tipimailSender: TipimailSender,
    @Inject("STRUCTURE_MODEL") private structureModel: Model<Structure>
  ) {
    this.lienImport = domifaConfig().apps.frontendUrl + "import";
    this.lienFaq = domifaConfig().apps.frontendUrl + "faq";
    this.lienGuide =
      domifaConfig().apps.frontendUrl +
      "assets/files/guide_utilisateur_domifa.pdf";
    this.domifaAdminMail = domifaConfig().email.emailAddressAdmin;
    this.domifaFromMail = domifaConfig().email.emailAddressFrom;
  }

  @Cron(domifaConfig().cron.emailImport.crontime)
  protected async sendMailImportCron() {
    if (!domifaConfig().cron.enable) {
      return;
    }

    await this.sendMailImports("cron");
  }

  public async sendMailImports(trigger: MonitoringBatchProcessTrigger) {
    monitoringBatchProcessSimpleCountRunner.monitorProcess(
      {
        processId: "mail-import-guide",
        trigger,
      },
      async ({ monitorTotal, monitorSuccess, monitorError }) => {
        const users = await this._findUsersToSendImportGuide();
        monitorTotal(users.length);

        for (const user of users) {
          try {
            await this._sentMailImportGuideToUser(user);
            monitorSuccess();
          } catch (err) {
            const totalErrors = monitorError(err);
            if (totalErrors > 10) {
              appLogger.warn(
                "[CronMailImportGuideSenderService] Too many errors: skip next users",
                {
                  context: err,
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
    const delay = domifaConfig().cron.emailImport.delay;
    const maxCreationDate: Date = moment()
      .utc()
      .subtract(delay.amount, delay.unit)
      .endOf("day")
      .toDate();

    const structuresIds: number[] = [];

    const structures: Pick<
      Structure,
      "id"
    >[] = (await this.structureModel
      .find({ import: false })
      .select(["id"])
      .lean()
      .exec()) as any;

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

  private async _sentMailImportGuideToUser(
    user: Pick<AppUser, "id" | "email" | "nom" | "prenom">
  ) {
    if (!user || user === null) {
      return;
    }

    const message: TipimailMessage = {
      templateId: "guide-import",
      subject: "Importer vos domiciliés sur DomiFa",
      model: {
        email: user.email,
        values: {
          import: this.lienImport,
          guide: this.lienGuide,
          faq: this.lienFaq,
        },
      },
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

    await this.tipimailSender.sendMail(message);

    await cronMailsRepository.updateMailFlag({
      userId: user.id,
      mailType: "import",
      value: true,
    });
  }
}
