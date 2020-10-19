import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "../../config/config.service";
import { Structure } from "../../structures/structure-interface";
import { User } from "../user.interface";
import * as mailjet from "node-mailjet";
import { appLogger } from "../../util";

@Injectable()
export class MailJetService {
  public mailjet: mailjet.Email.Client;

  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor(private readonly configService: ConfigService) {
    this.mailjet = mailjet.connect(
      this.configService.get("MJ_APIKEY_PUBLIC"),
      this.configService.get("MJ_APIKEY_PRIVATE")
    );
    this.domifaAdminMail = this.configService.get("DOMIFA_ADMIN_EMAIL");
    this.domifaFromMail = this.configService.get("DOMIFA_MAILJET_FROM_EMAIL");
  }

  public async newPassword(user: User): Promise<any> {
    const confirmationLink =
      this.configService.get("DOMIFA_FRONTEND_URL") +
      "reset-password/" +
      user.tokens.password;
    return this.mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: this.domifaFromMail,
            Name: "Domifa",
          },
          Subject: "Changement du mot de passe Domifa",
          TemplateID: 973152,
          TemplateLanguage: true,
          To: [
            {
              Email: user.email,
              Name: "Domifa",
            },
          ],
          Variables: {
            lien: confirmationLink,
            prenom: user.prenom,
          },
        },
      ],
    });
  }

  public confirmUser(user: User) {
    const lienConnexion =
      this.configService.get("DOMIFA_FRONTEND_URL") + "connexion";

    return this.mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: this.domifaFromMail,
            Name: "Domifa",
          },
          Subject: "Votre compte Domifa a été activé",
          TemplateID: 986336,
          TemplateLanguage: true,
          To: [
            {
              Email: user.email,
            },
          ],
          Variables: {
            lien: lienConnexion,
            prenom: user.prenom,
          },
        },
      ],
    });
  }

  public async confirmationStructure(
    structure: Structure,
    user: User
  ): Promise<any> {
    return this.mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: this.domifaFromMail,
            Name: "Domifa",
          },
          Subject: "Votre compte Domifa a été activé",
          TemplateID: 1001644,
          TemplateLanguage: true,
          To: [
            {
              Email: user.email,
              Name: "Domifa",
            },
          ],

          Variables: {
            lien: this.configService.get("DOMIFA_FRONTEND_URL"),
            nom_structure: structure.nom,
            prenom: user.prenom,
          },
        },
      ],
    });
  }

  public hardReset(user: User, token: string) {
    return this.mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: this.domifaFromMail,
            Name: "Domifa",
          },
          Subject: "Code de confirmation Domifa",
          TemplateID: 1206179,
          TemplateLanguage: true,
          To: [
            {
              Email: user.email,
            },
          ],
          Variables: {
            code: token,
            prenom: user.prenom,
          },
        },
      ],
    });
  }
}
