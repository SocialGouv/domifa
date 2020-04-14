import { MailerService } from "@nestjs-modules/mailer";
import { Injectable, HttpService } from "@nestjs/common";
import { User } from "../user.interface";
import { Observable } from "rxjs";
import { AxiosResponse } from "axios";
import { ConfigService } from "../../config/config.service";

@Injectable()
export class TipimailService {
  constructor(
    private readonly mailerService: MailerService,
    private httpService: HttpService
  ) {}

  public guideUtilisateur(user: User) {
    const config = new ConfigService();
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
        html: "<p>Coucou</p>",
      },
    };

    return this.httpService.post(
      "https://api.tipimail.com/v1/messages/send",
      post,
      {
        headers: {
          "X-Tipimail-ApiUser": config.get("SMTP_USER"),
          "X-Tipimail-ApiKey": config.get("SMTP_PASS"),
        },
      }
    );
  }

  public async guideUtilisateurNatif(user: User) {
    return this.mailerService.sendMail({
      to: user.email,
      from: {
        name: "Domifa",
        address: "diffusion@fabrique.social.gouv.fr",
      },
      subject: "Découvrez le guide utilisateur DomiFa !",
      template: "guide_utilisateur", // The `.twig` extension is appended automatically.
      context: {
        nom: user.prenom,
      },
    });
  }
}
