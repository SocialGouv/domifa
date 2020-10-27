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
  public newUser(admins: User[], user: User) {
    const adminEmails = [];
    const contentEmails = [];

    admins.map((admin: User) => {
      adminEmails.push({
        address: admin.email,
        personalName: admin.prenom + " " + admin.nom,
      });

      contentEmails.push({
        email: admin.email,
        subject: "Un nouvel utilisateur souhaite rejoindre votre structure",
        values: {
          admin_prenom: admin.prenom,
          lien: this.configService.get("DOMIFA_FRONTEND_URL") + "admin",
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
