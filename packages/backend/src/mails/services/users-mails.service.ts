import { HttpService, Injectable } from "@nestjs/common";

import { ConfigService } from "../../config";

import { User } from "../../users/user.interface";
import { UserProfil } from "../../users/user-profil.type";

@Injectable()
export class UsersMailsService {
  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor(
    private readonly configService: ConfigService,
    private httpService: HttpService
  ) {
    this.domifaAdminMail = this.configService.get("DOMIFA_ADMIN_EMAIL");
    this.domifaFromMail = this.configService.get("DOMIFA_TIPIMAIL_FROM_EMAIL");
  }

  //
  // Mail pour l'admin de la structure
  //
  public newUser(admin: User, user: User) {
    const post = {
      to: [
        {
          address: admin.email,
          personalName: admin.prenom + " " + admin.nom,
        },
      ],
      headers: {
        "X-TM-TEMPLATE": "users-nouvel-utilisateur-dans-votre-structure",
        "X-TM-SUB": [
          {
            email: admin.email,
            subject: "Nouvelle création de compte à valider",
            values: {
              admin_prenom: admin.prenom,
              lien: this.configService.get("DOMIFA_FRONTEND_URL") + "connexion",
              user_email: user.email,
              user_nom: user.nom,
              user_prenom: user.prenom,
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
        subject: "Nouvelle création de compte à valider",
        html: "<p>Test</p>",
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

  //
  // Mail pour l'utilisateur créé par un admin
  //
  public newUserFromAdmin(user: User) {
    const lien =
      process.env.DOMIFA_FRONTEND_URL +
      "reset-password/" +
      user.tokens.password;

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
          "X-Tipimail-ApiUser": process.env.SMTP_USER,
          "X-Tipimail-ApiKey": process.env.SMTP_PASS,
        },
      })
      .toPromise();
  }

  //
  // Mail pour l'utilisateur une fois son compte activé par l'admin
  //
  public accountActivated(user: UserProfil) {
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
              lien: this.configService.get("DOMIFA_FRONTEND_URL") + "connexion",
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
          "X-Tipimail-ApiUser": process.env.SMTP_USER,
          "X-Tipimail-ApiKey": process.env.SMTP_PASS,
        },
      })
      .toPromise();
  }

  //
  // Mail avec le lien pour réinitialiser son mot de passe
  //
  public async newPassword(user: User) {
    const confirmationLink =
      this.configService.get("DOMIFA_FRONTEND_URL") +
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
          "X-Tipimail-ApiUser": process.env.SMTP_USER,
          "X-Tipimail-ApiKey": process.env.SMTP_PASS,
        },
      })
      .toPromise();
  }
}
