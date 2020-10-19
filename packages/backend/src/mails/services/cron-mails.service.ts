import {
  HttpException,
  HttpService,
  HttpStatus,
  Inject,
  Injectable,
} from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import * as moment from "moment";
import { Model } from "mongoose";
import { ConfigService } from "../../config";
import { Structure } from "../../structures/structure-interface";

import { User } from "../../users/user.interface";

@Injectable()
export class CronMailsService {
  public lastWeek: Date;
  public listOfStructures: any;
  public lienGuide: string;
  public lienImport: string;
  public lienFaq: string;
  private domifaAdminMail: string;
  private domifaFromMail: string;
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @Inject("USER_MODEL") private userModel: Model<User>,
    @Inject("STRUCTURE_MODEL") private structureModel: Model<Structure>
  ) {
    this.lastWeek = moment().utc().subtract(7, "days").endOf("day").toDate();

    this.listOfStructures = [];

    this.lienGuide =
      process.env.DOMIFA_FRONTEND_URL +
      "assets/files/guide_utilisateur_domifa.pdf";

    this.lienImport = process.env.DOMIFA_FRONTEND_URL + "import";

    this.lienFaq = process.env.DOMIFA_FRONTEND_URL + "faq";
    this.domifaAdminMail = this.configService.get("DOMIFA_ADMIN_EMAIL");
    this.domifaFromMail = this.configService.get("DOMIFA_TIPIMAIL_FROM_EMAIL");
  }

  @Cron("0 8 * * TUE")
  public async cronGuide() {
    if (this.configService.get("DOMIFA_CRON_ENABLED") !== "true") {
      return;
    }

    const user = await this.userModel
      .findOne({
        createdAt: { $lte: this.lastWeek },
        "mails.guide": false,
      })
      .select("-import -token -users -verified")
      .lean()
      .exec();

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
          this.userModel
            .findOneAndUpdate(
              { _id: user._id },
              { $set: { "mails.guide": true } }
            )
            .exec((erreur: any) => {
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
    if (this.configService.get("DOMIFA_CRON_ENABLED") !== "true") {
      return;
    }
    this.listOfStructures = [];
    this.structureModel
      .find({ import: false })
      .lean()
      .exec((erreur: any, structures: any) => {
        for (const structure of structures) {
          this.listOfStructures.push(structure.id);
        }
        this.sentImportGuide();
      });
  }

  private async sentImportGuide() {
    const user = await this.userModel
      .findOne({
        structureId: { $in: this.listOfStructures },
        createdAt: { $lte: this.lastWeek },
        "mails.import": false,
      })
      .select("-import -token -users -verified")
      .lean()
      .exec();

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
          this.userModel
            .findOneAndUpdate(
              { _id: user._id },
              { $set: { "mails.import": true } }
            )
            .exec((erreur: any) => {
              // console.log("-- UPDATE MAIL VALUE");
              if (erreur === null) {
                this.sentImportGuide();
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
