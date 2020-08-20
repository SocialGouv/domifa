import {
  Injectable,
  HttpService,
  Inject,
  HttpStatus,
  HttpException,
  UseFilters,
} from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
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

  @Cron("0 8 * * TUE")
  public async cronGuide() {
    if (process.env.FRONT_URL !== "http://domifa.fabrique.social.gouv.fr/") {
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

  @Cron("0 15 * * TUE")
  public async cronImport() {
    if (process.env.FRONT_URL !== "http://domifa.fabrique.social.gouv.fr/") {
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

  public async sentImportGuide() {
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

  public async deleteStructure(structure: Structure) {
    const lien =
      process.env.FRONT_URL +
      "structures/delete/" +
      structure._id +
      "/" +
      structure.token;

    const post = {
      to: [
        {
          address: "contact.domifa@fabrique.social.gouv.fr",
          personalName: "Site Domifa",
        },
      ],
      headers: {
        "X-TM-TEMPLATE": "supprimer-structure",
        "X-TM-SUB": [
          {
            email: "contact.domifa@fabrique.social.gouv.fr",
            values: {
              lien,
              nom: structure.nom,
              adresse: structure.adresse,
              ville: structure.ville,
              code_postal: structure.codePostal,
              email: structure.email,
              phone: structure.phone,
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
          return true;
        },
        (erreur: any) => {
          throw new HttpException(
            "MAIL_SUPPRESSION_STRUCTURE",
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      );
  }
  public async registerConfirm(user: User) {
    const lien =
      process.env.FRONT_URL + "reset-password/" + user.tokens.password;
    const post = {
      to: [
        {
          address: user.email,
          personalName: user.nom + " " + user.prenom,
        },
      ],
      headers: {
        "X-TM-TEMPLATE": "creation-compte",
        "X-TM-SUB": [
          {
            email: user.email,
            values: {
              prenom: user.prenom,
              lien,
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
          return true;
        },
        (erreur: any) => {
          throw new HttpException(
            "MAIL_CONFIRMATION_CREATION_ADMIN",
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      );
  }
}
