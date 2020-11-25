import { HttpService, Injectable } from "@nestjs/common";
import { domifaConfig } from "../../config";
import { Structure } from "../../structures/structure-interface";
import { UserProfile } from "../../_common/model";

@Injectable()
export class StructuresMailsService {
  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor(private httpService: HttpService) {
    this.domifaAdminMail = domifaConfig().email.emailAddressAdmin;
    this.domifaFromMail = domifaConfig().email.emailAddressFrom;
  }

  public async confirmationStructure(
    structure: Structure,
    user: UserProfile
  ): Promise<any> {
    const frontendUrl = domifaConfig().apps.frontendUrl;
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
              lien: frontendUrl,
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
          "X-Tipimail-ApiUser": domifaConfig().email.smtp.user,
          "X-Tipimail-ApiKey": domifaConfig().email.smtp.pass,
        },
      })
      .toPromise();
  }
}
