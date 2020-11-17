import {
  HttpException,
  HttpService,
  HttpStatus,
  Inject,
  Injectable
} from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import * as moment from "moment";
import { Model } from "mongoose";
import { configService } from "../../config";
import { Structure } from "../../structures/structure-interface";
import { appLogger } from "../../util";
import { cronMailsRepository } from "../pg";

@Injectable()
export class CronMailsService {
  public lienGuide: string;
  public lienImport: string;
  public lienFaq: string;
  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor(
    private httpService: HttpService,
    @Inject("STRUCTURE_MODEL") private structureModel: Model<Structure>
  ) {
    this.lienGuide =
      process.env.DOMIFA_FRONTEND_URL +
      "assets/files/guide_utilisateur_domifa.pdf";

    this.lienImport = process.env.DOMIFA_FRONTEND_URL + "import";

    this.lienFaq = process.env.DOMIFA_FRONTEND_URL + "faq";
    this.domifaAdminMail = configService.get("DOMIFA_ADMIN_EMAIL");
    this.domifaFromMail = configService.get("DOMIFA_TIPIMAIL_FROM_EMAIL");
  }

  @Cron("0 8 * * TUE")
  public async cronGuide() {
    if (configService.get("DOMIFA_CRON_ENABLED") !== "true") {
      return;
    }

    const maxCreationDate: Date = moment()
      .utc()
      .subtract(7, "days")
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

    const post = {
      to: [
        {
          address: user.email,
          personalName: user.nom + " " + user.prenom,
        },
      ],
      headers: {
        "X-TM-TEMPLATE": "guide-utilisateur",
        "X-TM-SUB": [
          {
            email: user.email,
            values: {
              nom: user.prenom,
              lien: this.lienGuide,
            },
            meta: {},
          },
        ],
      },
      msg: {
        from: {
          personalName: "Domifa",
          address: this.domifaFromMail,
        },
        replyTo: {
          personalName: "Domifa",
          address: this.domifaAdminMail,
        },
        subject: "Le guide utilisateur Domifa",
        html: "<p>Test</p>",
      },
    };

    this.httpService
      .post("https://api.tipimail.com/v1/messages/send", post, {
        headers: {
          "X-Tipimail-ApiUser": process.env.SMTP_USER,
          "X-Tipimail-ApiKey": process.env.SMTP_PASS,
        },
      })
      .subscribe(
        (retour: any) => {
          cronMailsRepository
            .updateMailFlag({
              userId: user.id,
              mailType: "guide",
              value: true,
            })
            .catch((erreur: Error) => {
              // console.log("-- UPDATE MAIL VALUE");
              if (erreur === null) {
                this.cronGuide();
              } else {
                throw new HttpException(
                  "CANNOT_UPDATE_MAIL_GUIDE",
                  HttpStatus.INTERNAL_SERVER_ERROR
                );
              }
            });
        },
        (erreur: any) => {
          throw new HttpException(
            "TIPIMAIL_GUIDE_ERROR",
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      );
  }

  @Cron("0 15 * * TUE")
  public async cronImport() {
    if (configService.get("DOMIFA_CRON_ENABLED") !== "true") {
      return;
    }

    const maxCreationDate: Date = moment()
      .utc()
      .subtract(7, "days")
      .endOf("day")
      .toDate();

    const structuresIds: number[] = [];
    this.structureModel
      .find({ import: false })
      .select(["id"])
      .lean()
      .exec((error: Error, structures: Pick<Structure, "id">[]) => {
        if (error) {
          appLogger.error("[CronMailsService] Error running cron import", {
            error,
            sentry: true,
          });
          return;
        }
        if (structures.length === 0) {
          return;
        }
        for (const structure of structures) {
          structuresIds.push(structure.id);
        }
        this.sentImportGuide({
          structuresIds,
          maxCreationDate,
        });
      });
  }

  private async sentImportGuide({
    structuresIds,
    maxCreationDate,
  }: {
    structuresIds: number[];
    maxCreationDate: Date;
  }) {
    const user = await cronMailsRepository.findNextUserToSendCronMail({
      maxCreationDate,
      structuresIds,
      mailType: "import",
    });

    if (!user || user === null) {
      return;
    }

    const post = {
      to: [
        {
          address: user.email,
          personalName: user.nom + " " + user.prenom,
        },
      ],
      headers: {
        "X-TM-TEMPLATE": "guide-import",
        "X-TM-SUB": [
          {
            email: user.email,
            values: {
              import: this.lienImport,
              guide: this.lienGuide,
              faq: this.lienFaq,
            },
          },
        ],
      },
      msg: {
        from: {
          personalName: "Domifa",
          address: this.domifaFromMail,
        },
        replyTo: {
          personalName: "Domifa",
          address: this.domifaAdminMail,
        },
        subject: "Importer vos domiciliés sur DomiFa",
        html: "<p>Test</p>",
      },
    };

    this.httpService
      .post("https://api.tipimail.com/v1/messages/send", post, {
        headers: {
          "X-Tipimail-ApiUser": process.env.SMTP_USER,
          "X-Tipimail-ApiKey": process.env.SMTP_PASS,
        },
      })
      .subscribe(
        (retour: any) => {
          cronMailsRepository
            .updateMailFlag({
              userId: user.id,
              mailType: "import",
              value: true,
            })
            .catch((erreur: any) => {
              // console.log("-- UPDATE MAIL VALUE");
              if (erreur === null) {
                this.sentImportGuide({
                  structuresIds,
                  maxCreationDate,
                });
              } else {
                throw new HttpException(
                  "CANNOT_UPDATE_MAIL_IMPORT",
                  HttpStatus.INTERNAL_SERVER_ERROR
                );
              }
            });
        },
        (erreur: any) => {
          throw new HttpException(
            "TIPIMAIL_IMPORT_ERROR",
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      );
  }
}
