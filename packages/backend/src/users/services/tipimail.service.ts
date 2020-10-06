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
import { Usager } from "../../usagers/interfaces/usagers";
import { User } from "../user.interface";

@Injectable()
export class TipimailService {
  public lastWeek: Date;
  public listOfStructures: any;
  public lienGuide: string;
  public lienImport: string;
  public lienFaq: string;
  private domifaAdminMail: string;
  private domifaFromMail: string;
  constructor(
    private readonly configService: ConfigService,
    @Inject("USER_MODEL") private readonly userModel: Model<User>,
    @Inject("STRUCTURE_MODEL")
    private readonly structureModel: Model<Structure>,
    private httpService: HttpService
  ) {
    this.lastWeek = moment().utc().subtract(7, "days").endOf("day").toDate();

    this.listOfStructures = [];

    this.lienGuide =
      process.env.DOMIFA_FRONTEND_URL +
      "assets/files/guide_utilisateur_domifa.pdf";

    this.lienImport = process.env.DOMIFA_FRONTEND_URL + "import";

    this.lienFaq = process.env.DOMIFA_FRONTEND_URL + "faq";
    this.domifaAdminMail = this.configService.get("DOMIFA_ADMIN_EMAIL");
    this.domifaFromMail = this.configService.get("DOMIFA_FROM_EMAIL");
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
          address: this.domifaFromMail,
        },
        replyTo: {
          personalName: "Domifa",
          address: this.domifaAdminMail,
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
      process.env.DOMIFA_FRONTEND_URL +
      "structures/delete/" +
      structure._id +
      "/" +
      structure.token;

    const post = {
      to: [
        {
          address: this.domifaAdminMail,
          personalName: "Site Domifa",
        },
      ],
      headers: {
        "X-TM-TEMPLATE": "supprimer-structure",
        "X-TM-SUB": [
          {
            email: this.domifaAdminMail,
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
          address: this.domifaFromMail,
        },
        replyTo: {
          personalName: "Domifa",
          address: this.domifaAdminMail,
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
      process.env.DOMIFA_FRONTEND_URL +
      "reset-password/" +
      user.tokens.password;
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
          address: this.domifaFromMail,
        },
        replyTo: {
          personalName: "Domifa",
          address: this.domifaAdminMail,
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

  public async mailRdv(
    user: User,
    usager: Usager,
    event: any,
    message: string
  ) {
    const prenomUsager =
      (usager.sexe === "homme" ? "M. " : "Mme. ") +
      usager.nom +
      " " +
      usager.prenom;

    const date = moment(new Date(usager.rdv.dateRdv)).locale("fr").format("L");
    const heure = moment(new Date(usager.rdv.dateRdv))
      .locale("fr")
      .format("LT");

    const datas = {
      prenom: user.prenom,
      usager: prenomUsager,
      date,
      heure,
      message,
    };

    const post = {
      to: [
        {
          address: user.email,
          personalName: user.prenom + " " + user.nom,
        },
      ],
      headers: {
        "X-TM-TEMPLATE": "prise-rdv",
        "X-TM-SUB": [
          {
            email: user.email,
            values: datas,
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
        subject: "Prise de rendez-vous entre le demandeur et un collaborateur",
        html: "<p>Test</p>",
        attachments: [
          {
            contentType: "text/calendar",
            filename: "invitation.ics",
            content: event,
          },
        ],
      },
    };

    return this.httpService
      .post("https://api.tipimail.com/v1/messages/send", post, {
        headers: {
          "X-Tipimail-ApiUser": process.env.SMTP_USER,
          "X-Tipimail-ApiKey": process.env.SMTP_PASS,
        },
      })
      .toPromise();
  }
}
