import { Injectable, HttpService } from "@nestjs/common";
import { User } from "../user.interface";

@Injectable()
export class TipimailService {
  constructor(private httpService: HttpService) {}

  public guideUtilisateur(user: User) {
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

    return this.httpService.post(
      "https://api.tipimail.com/v1/messages/send",
      post,
      {
        headers: {
          "X-Tipimail-ApiUser": process.env.SMTP_USER,
          "X-Tipimail-ApiKey": process.env.SMTP_PASS,
        },
      }
    );
  }
}
