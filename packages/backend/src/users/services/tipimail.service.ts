import {
  Injectable,
  HttpService,
  Inject,
  HttpStatus,
  HttpException,
} from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { Model } from "mongoose";
import * as moment from "moment";

import { Structure } from "../../structures/structure-interface";
import { User } from "../user.interface";

@Injectable()
export class TipimailService {
  public lastWeek: Date;
  public listOfStructures: any;
  public lienGuide: string;
  public lienImport: string;
  public lienFaq: string;
  constructor(
    @Inject("USER_MODEL") private readonly userModel: Model<User>,
    @Inject("STRUCTURE_MODEL")
    private readonly structureModel: Model<Structure>,
    private httpService: HttpService
  ) {
    this.lastWeek = moment().utc().subtract(7, "days").endOf("day").toDate();
    this.listOfStructures = [];

    this.lienGuide =
      process.env.FRONT_URL + "assets/files/guide_utilisateur_domifa.pdf";
    this.lienImport = process.env.FRONT_URL + "import";
    this.lienFaq = process.env.FRONT_URL + "faq";
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  public async cronGuide() {
    // console.log("---- ENTER CRON");
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
          address: "contact.domifa@diffusion.social.gouv.fr",
        },
        replyTo: {
          personalName: "Domifa",
          address: "contact.domifa@fabrique.social.gouv.fr",
        },
        subject: "Subject",
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
              {
                _id: user._id,
              },
              {
                $set: {
                  "mails.guide": true,
                },
              }
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

  @Cron(CronExpression.EVERY_DAY_AT_2PM)
  public async cronImport() {
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
              lienImport: this.lienImport,
              lienGuide: this.lienGuide,
              lienFaq: this.lienFaq,
            },
            meta: {},
          },
        ],
      },
      msg: {
        from: {
          personalName: "Domifa",
          address: "contact.domifa@diffusion.social.gouv.fr",
        },
        replyTo: {
          personalName: "Domifa",
          address: "contact.domifa@fabrique.social.gouv.fr",
        },
        subject: "Subject",
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
