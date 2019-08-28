import { Injectable } from "@nestjs/common";
import * as mailjet from "node-mailjet";
import { ConfigService } from "../config/config.service";
import { Structure } from "../structures/structure-interface";
import { User } from "./user.interface";

@Injectable()
export class MailerService {
  public mailjet: any;
  public labels = {
    asso: "Organisme agrée",
    ccas: "CCAS / CIAS"
  };

  constructor(private readonly configService: ConfigService) {
    this.mailjet = require("node-mailjet").connect(
      this.configService.get("MJ_APIKEY_PUBLIC"),
      this.configService.get("MJ_APIKEY_PRIVATE")
    );
  }

  public newStructure(structure: Structure) {
    const confirmationLink =
      this.configService.get("FRONT_URL") +
      "structures/confirm/" +
      structure.token;

    const request = this.mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "contact@domifa.beta.gouv.fr",
            Name: "Domifa"
          },
          Subject: "Nouvelle structure : " + structure.nom,
          TemplateID: 968710,
          TemplateLanguage: true,
          To: [
            {
              Email: "yr.achats@gmail.com",
              Name: "Domifa"
            }
          ],
          Variables: {
            adresse: structure.adresse,
            agrement: structure.agrement,
            codePostal: structure.codePostal,
            confirmation_link: confirmationLink,
            departement: structure.departement,
            email: structure.email,
            phone: structure.phone,
            responsable_fonction: structure.responsable.fonction,
            responsable_nom: structure.responsable.nom,
            responsable_prenom: structure.responsable.prenom,
            structure_name: structure.nom,
            structure_type: this.labels[structure.structureType],
            ville: structure.ville
          }
        }
      ]
    });
  }

  public async newPassword(user: User): Promise<any> {
    const confirmationLink =
      this.configService.get("FRONT_URL") +
      "reset-password/" +
      user.tokens.password;
    return this.mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "contact@domifa.beta.gouv.fr",
            Name: "Domifa"
          },
          Subject: "Changement du mot de passe",
          TemplateID: 973152,
          TemplateLanguage: true,
          To: [
            {
              Email: user.email,
              Name: "Domifa"
            }
          ],
          Variables: {
            lien: confirmationLink,
            prenom: user.prenom
          }
        }
      ]
    });
  }
}
