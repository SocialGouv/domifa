import { HttpService, Injectable } from "@nestjs/common";
import * as moment from "moment";
import { domifaConfig } from "../../config";
import { Usager } from "../../usagers/interfaces/usagers";
import { AppUserForAdminEmail } from "../../users/pg/users-repository.service";

@Injectable()
export class UsagersMailsService {
  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor(private httpService: HttpService) {
    this.domifaAdminMail = domifaConfig().email.emailAddressAdmin;
    this.domifaFromMail = domifaConfig().email.emailAddressFrom;
  }

  public async mailRdv(
    user: AppUserForAdminEmail,
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
        "X-TM-TEMPLATE": "usagers-prise-de-rendez-vous",
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
        attachments: [
          {
            contentType: "text/calendar",
            filename: "invitation.ics",
            content: event,
          },
        ],
        html: "<p>Test</p>",
      },
    };

    return this.httpService
      .post("https://api.tipimail.com/v1/messages/send", post, {
        headers: {
          "X-Tipimail-ApiUser": domifaConfig().email.smtp.user,
          "X-Tipimail-ApiKey": domifaConfig().email.smtp.pass,
        },
      })
      .toPromise();
  }

  public hardReset(user: AppUserForAdminEmail, token: string) {
    const post = {
      to: [
        {
          address: user.email,
          personalName: user.prenom + " " + user.nom,
        },
      ],
      headers: {
        "X-TM-TEMPLATE": "usagers-hard-reset",
        "X-TM-SUB": [
          {
            email: user.email,
            values: { code: token, prenom: user.prenom },
            subject: "Code de confirmation Domifa pour supprimer les usagers",
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
        subject: "Code de confirmation Domifa pour supprimer les usagers",
        html: "<p>Test</p>",
      },
    };

    return this.httpService
      .post("https://api.tipimail.com/v1/messages/send", post, {
        headers: {
          "X-Tipimail-ApiUser": domifaConfig().email.smtp.user,
          "X-Tipimail-ApiKey": domifaConfig().email.smtp.pass,
        },
      })
      .toPromise();
  }
}
