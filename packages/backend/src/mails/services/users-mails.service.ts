import { HttpService, Injectable } from "@nestjs/common";
import { domifaConfig } from "../../config";
import { AppUserTable } from "../../users/pg";
import {
  AppUserForAdminEmail,
  AppUserForAdminEmailWithTempTokens
} from "../../users/pg/users-repository.service";

@Injectable()
export class UsersMailsService {
  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor(private httpService: HttpService) {
    this.domifaAdminMail = domifaConfig().email.emailAddressAdmin;
    this.domifaFromMail = domifaConfig().email.emailAddressFrom;
  }

  //
  // Mail pour l'admin de la structure
  //
  public newUser(admins: AppUserForAdminEmail[], user: AppUserTable) {
    const adminEmails = [];
    const contentEmails = [];

    admins.map((admin: AppUserForAdminEmail) => {
      adminEmails.push({
        address: admin.email,
        personalName: admin.prenom + " " + admin.nom,
      });

      const frontendUrl = domifaConfig().apps.frontendUrl;
      contentEmails.push({
        email: admin.email,
        subject: "Un nouvel utilisateur souhaite rejoindre votre structure",
        values: {
          admin_prenom: admin.prenom,
          lien: frontendUrl + "admin",
          user_email: user.email,
          user_nom: user.nom,
          user_prenom: user.prenom,
        },
        meta: {},
      });
    });

    const post = {
      to: adminEmails,
      headers: {
        "X-TM-TEMPLATE": "users-nouvel-utilisateur-dans-votre-structure",
        "X-TM-SUB": contentEmails,
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
        subject: "Un nouvel utilisateur souhaite rejoindre votre structure",
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

  //
  // Mail pour l'utilisateur créé par un admin
  //
  public newUserFromAdmin(user: AppUserForAdminEmailWithTempTokens) {
    const lien =
      domifaConfig().apps.frontendUrl +
      "reset-password/" +
      user.temporaryTokens.password;

    const post = {
      to: [
        {
          address: user.email,
          personalName: user.prenom + " " + user.nom,
        },
      ],
      headers: {
        "X-TM-TEMPLATE": "users-creation-compte-par-un-admin",
        "X-TM-SUB": [
          {
            email: user.email,
            values: {
              prenom: user.prenom,
              lien,
            },
            subject: "Finalisez votre inscription sur Domifa",
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
        subject: "Finalisez votre inscription sur Domifa",
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

  //
  // Mail pour l'utilisateur une fois son compte activé par l'admin
  //
  public accountActivated(user: AppUserForAdminEmail) {
    const frontendUrl = domifaConfig().apps.frontendUrl;
    const post = {
      to: [
        {
          address: user.email,
          personalName: user.nom + " " + user.prenom,
        },
      ],
      headers: {
        "X-TM-TEMPLATE": "users-compte-active",
        "X-TM-SUB": [
          {
            email: user.email,
            subject: "Votre compte Domifa a été activé",
            values: {
              lien: frontendUrl + "connexion",
              prenom: user.prenom,
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
        subject: "Votre compte Domifa a été activé",
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

  //
  // Mail avec le lien pour réinitialiser son mot de passe
  //
  public async newPassword(user: AppUserForAdminEmailWithTempTokens) {
    const frontendUrl = domifaConfig().apps.frontendUrl;
    const confirmationLink =
      frontendUrl + "reset-password/" + user.temporaryTokens.password;

    const post = {
      to: [
        {
          address: user.email,
          personalName: user.nom + " " + user.prenom,
        },
      ],
      headers: {
        "X-TM-TEMPLATE": "users-nouveau-mot-de-passe",
        "X-TM-SUB": [
          {
            email: user.email,
            subject: "Demande d'un nouveau mot de passe",
            values: {
              lien: confirmationLink,
              prenom: user.prenom,
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
        subject: "Demande d'un nouveau mot de passe",
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
