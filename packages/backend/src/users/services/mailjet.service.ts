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
}
