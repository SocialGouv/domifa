import { HttpException, HttpService, Injectable } from "@nestjs/common";

import { ConfigService } from "../../config";

import { User } from "../../users/user.interface";

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

  public newUser(admin: User, user: User) {
    const post = {
      to: [
        {
          address: this.domifaAdminMail,
          personalName: "Domifa",
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

  public newUserFromAdmin(user: User) {
    const lien =
      process.env.DOMIFA_FRONTEND_URL +
      "reset-password/" +
      user.tokens.password;

    const post = {
      to: [
        {
          address: this.domifaAdminMail,
          personalName: "Domifa",
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

  public confirmUser(user: User) {
    // TODO : rappatrier le model
  }

  public async newPassword(user: User): Promise<any> {
    // TODO : rappatrier le model
  }
}
