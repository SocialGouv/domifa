import { HttpService, Injectable, HttpException } from "@nestjs/common";

import { ConfigService } from "../../config";

import { User } from "../../users/user.interface";
import { Structure } from "../../structures/structure-interface";

@Injectable()
export class DomifaMailsService {
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
  // Indiquer la création d'une structure à l'équipe Domifa
  //
  public newStructure(structure: Structure, user: User) {
    const route = structure._id + "/" + structure.token;
    const confirmationLink =
      this.configService.get("DOMIFA_FRONTEND_URL") +
      "structures/confirm/" +
      route;

    const deleteLink =
      this.configService.get("DOMIFA_FRONTEND_URL") +
      "structures/delete/" +
      route;

    const post = {
      to: [
        {
          address: this.domifaAdminMail,
          personalName: "Domifa",
        },
      ],
      headers: {
        "X-TM-TEMPLATE": "domifa-nouvelle-structure",
        "X-TM-SUB": [
          {
            email: user.email,
            values: {
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
              ville: structure.ville,
            },
            subject: "Nouvelle structure sur Domifa : " + structure.nom,
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
        subject: "Nouvelle structure sur Domifa : " + structure.nom,
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
  // Demande de suppression d'une structure à l'équipe Domifa
  //
  public async deleteStructure(structure: Structure) {
    const lien =
      process.env.DOMIFA_FRONTEND_URL +
      "structures/delete/" +
      structure._id +
      "/" +
      structure.token;

    const post = {
      to: [
        {
          address: this.domifaAdminMail,
          personalName: "Domifa",
        },
      ],
      headers: {
        "X-TM-TEMPLATE": "domifa-supprimer-structure",
        "X-TM-SUB": [
          {
            email: this.domifaAdminMail,
            values: {
              lien,
              nom: structure.nom,
              adresse: structure.adresse,
              ville: structure.ville,
              code_postal: structure.codePostal,
              email: structure.email,
              phone: structure.phone,
            },
            subject: "Supprimer une structure sur Domifa",
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
        subject: "Supprimer une structure sur Domifa",
        html: "<p>Test</p>",
      },
    };

    this.httpService
      .post("https://api.tipimail.com/v1/messages/send", post, {
        headers: {
          "X-Tipimail-ApiUser": process.env.SMTP_USER,
          "X-Tipimail-ApiKey": process.env.SMTP_PASS,
        },
      })
      .toPromise();
  }
}
