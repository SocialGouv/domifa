import { Inject, Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import * as moment from "moment";
import { Model } from "mongoose";
import { domifaConfig } from "../../config";
import { cronMailsRepository } from "../../database";
import { Structure } from "../../structures/structure-interface";
import { appLogger } from "../../util";
import { TipimailMessage, TipimailSender } from "./tipimail-sender.service";

@Injectable()
export class CronMailsService {
  public lienGuide: string;
  public lienImport: string;
  public lienFaq: string;
  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor(
    private tipimailSender: TipimailSender,
    @Inject("STRUCTURE_MODEL") private structureModel: Model<Structure>
  ) {
    this.lienGuide =
      domifaConfig().apps.frontendUrl +
      "assets/files/guide_utilisateur_domifa.pdf";

    this.lienImport = domifaConfig().apps.frontendUrl + "import";

    this.lienFaq = domifaConfig().apps.frontendUrl + "faq";
    this.domifaAdminMail = domifaConfig().email.emailAddressAdmin;
    this.domifaFromMail = domifaConfig().email.emailAddressFrom;
  }

  @Cron(domifaConfig().cron.emailGuide.crontime)
  public async cronGuide() {
    if (!domifaConfig().cron.enable) {
      return;
    }
    const delay = domifaConfig().cron.emailGuide.delay;
    const maxCreationDate: Date = moment()
      .utc()
      .subtract(delay.amount, delay.unit)
      .endOf("day")
      .toDate();

    const user = await cronMailsRepository.findNextUserToSendCronMail({
      maxCreationDate,
      structuresIds: undefined, // not used here
      mailType: "guide",
    });

    if (!user || user === null) {
      // console.log("---- LEAVE CRON NO STRUCTURE");
      return;
    }

    const message: TipimailMessage = {
      templateId: "guide-utilisateur",
      subject: "Le guide utilisateur Domifa",
      model: {
        email: user.email,
        values: {
          nom: user.prenom,
          lien: this.lienGuide,
        },
        meta: {},
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
      mailType: "guide",
      value: true,
    });

    await this.cronGuide();
  }

  @Cron(domifaConfig().cron.emailImport.crontime)
  public async cronImport() {
    if (!domifaConfig().cron.enable) {
      return;
    }
    const delay = domifaConfig().cron.emailImport.delay;
    const maxCreationDate: Date = moment()
      .utc()
      .subtract(delay.amount, delay.unit)
      .endOf("day")
      .toDate();

    const structuresIds: number[] = [];

    try {
      const structures: Pick<
        Structure,
        "id"
      >[] = (await this.structureModel
        .find({ import: false })
        .select(["id"])
        .lean()
        .exec()) as any;

      if (structures.length === 0) {
        return;
      }
      for (const structure of structures) {
        structuresIds.push(structure.id);
      }
      await this.sentImportGuide({
        structuresIds,
        maxCreationDate,
      });
    } catch (error) {
      appLogger.error("[CronMailsService] Error running cron import", {
        error,
        sentry: true,
      });
      throw error;
    }
  }

  private async sentImportGuide({
    structuresIds,
    maxCreationDate,
  }: {
    structuresIds: number[];
    maxCreationDate: Date;
  }) {
    if (structuresIds.length === 0) {
      return;
    }
    const user = await cronMailsRepository.findNextUserToSendCronMail({
      maxCreationDate,
      structuresIds,
      mailType: "import",
    });

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

    await this.sentImportGuide({
      structuresIds,
      maxCreationDate,
    });
  }
}
