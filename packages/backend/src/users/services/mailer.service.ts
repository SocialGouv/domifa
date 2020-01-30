import { Injectable } from "@nestjs/common";
import { ConfigService } from "../../config/config.service";
import { Structure } from "../../structures/structure-interface";
import { User } from "../user.interface";

@Injectable()
export class MailerService {
  public mailjet: any;

  constructor(private readonly configService: ConfigService) {
    this.mailjet = require("node-mailjet").connect(
      this.configService.get("MJ_APIKEY_PUBLIC"),
      this.configService.get("MJ_APIKEY_PRIVATE")
    );
  }

  public newStructure(structure: Structure, user: User) {
    const confirmationLink =
      this.configService.get("FRONT_URL") +
      "structures/confirm/" +
      structure.token;

    const deleteLink =
      this.configService.get("FRONT_URL") +
      "structures/delete/" +
      structure.token;

    return this.mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "contact.domifa@fabrique.social.gouv.fr",
            Name: "Domifa"
          },
          Subject: "Nouvelle structure sur Domifa : " + structure.nom,
          TemplateID: 987764,
          TemplateLanguage: true,
          To: [
            {
              Email: "contact.domifa@fabrique.social.gouv.fr",
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
            lien_confirmation: confirmationLink,
            lien_suppression: deleteLink,
            phone: structure.phone,
            responsable_fonction: structure.responsable.fonction,
            responsable_nom: structure.responsable.nom,
            responsable_prenom: structure.responsable.prenom,
            structure_name: structure.nom,
            structure_type:
              structure.structureType === "asso"
                ? "Organisme agrée"
                : "CCAS / CIAS",
            user_email: user.email,
            user_nom: user.nom,
            user_prenom: user.prenom,
            ville: structure.ville
          }
        }
      ]
    });
  }

  public newUser(admin: User, user: User) {
    const lienConnexion = this.configService.get("FRONT_URL") + "connexion";
    return this.mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "contact.domifa@fabrique.social.gouv.fr",
            Name: "Domifa"
          },
          Subject: "Nouvelle création de compte à valider",
          TemplateID: 988278,
          TemplateLanguage: true,
          To: [
            {
              Email: admin.email
            }
          ],
          Variables: {
            admin_prenom: admin.prenom,
            lien: lienConnexion,
            user_email: user.email,
            user_nom: user.nom,
            user_prenom: user.prenom
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
            Email: "contact.domifa@fabrique.social.gouv.fr",
            Name: "Domifa"
          },
          Subject: "Changement du mot de passe Domifa",
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

  public confirmUser(user: User) {
    const lienConnexion = this.configService.get("FRONT_URL") + "connexion";

    return this.mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "contact.domifa@fabrique.social.gouv.fr",
            Name: "Domifa"
          },
          Subject: "Votre compte Domifa a été activé",
          TemplateID: 986336,
          TemplateLanguage: true,
          To: [
            {
              Email: user.email
            }
          ],
          Variables: {
            lien: lienConnexion,
            prenom: user.prenom
          }
        }
      ]
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
            Email: "contact.domifa@fabrique.social.gouv.fr",
            Name: "Domifa"
          },
          Subject: "Votre compte Domifa a été activé",
          TemplateID: 1001644,
          TemplateLanguage: true,
          To: [
            {
              Email: user.email,
              Name: "Domifa"
            }
          ],

          Variables: {
            lien: this.configService.get("FRONT_URL"),
            nom_structure: structure.nom,
            prenom: user.prenom
          }
        }
      ]
    });
  }

  public hardReset(user: User, token: string) {
    return this.mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "contact.domifa@fabrique.social.gouv.fr",
            Name: "Domifa"
          },
          Subject: "Code de confirmation Domifa",
          TemplateID: 1206179,
          TemplateLanguage: true,
          To: [
            {
              Email: user.email
            }
          ],
          Variables: {
            code: token,
            prenom: user.prenom
          }
        }
      ]
    });
  }
}
