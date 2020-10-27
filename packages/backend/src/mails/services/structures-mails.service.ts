import { HttpService, Injectable } from "@nestjs/common";
import { configService } from "../../config";
import { Structure } from "../../structures/structure-interface";
import { UserProfil } from "../../users/user-profil.type";

@Injectable()
export class StructuresMailsService {
  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor(private httpService: HttpService) {
    this.domifaAdminMail = configService.get("DOMIFA_ADMIN_EMAIL");
    this.domifaFromMail = configService.get("DOMIFA_TIPIMAIL_FROM_EMAIL");
  }

  public async confirmationStructure(
    structure: Structure,
    user: UserProfil
  ): Promise<any> {
    const post = {
      to: [
        {
          address: user.email,
          personalName: user.prenom + " " + user.nom,
        },
      ],
      headers: {
        "X-TM-TEMPLATE": "users-compte-active",
        "X-TM-SUB": [
          {
            email: user.email,
            values: {
              lien: configService.get("DOMIFA_FRONTEND_URL"),
              nom_structure: structure.nom,
              prenom: user.prenom,
            },
            subject: "Votre compte Domifa a été activé",
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
}
