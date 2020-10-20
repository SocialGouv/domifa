import { HttpService, Injectable, HttpException } from "@nestjs/common";

import { ConfigService } from "../../config";

import { User } from "../../users/user.interface";
import { Structure } from "../../structures/structure-interface";
import { DEPARTEMENTS_MAP } from "../../structures/DEPARTEMENTS_MAP.const";

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
    const lienConfirmation =
      this.configService.get("DOMIFA_FRONTEND_URL") +
      "structures/confirm/" +
      route;

    const lienSuppression =
      this.configService.get("DOMIFA_FRONTEND_URL") +
      "structures/delete/" +
      route;

    const structureTypes = {
      asso: "Organisme agrée",
      ccas: "CCAS",
      cias: "CIAS",
    };

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
            email: this.domifaAdminMail,
            values: {
              structure_name: structure.nom,
              structure_type: structureTypes[structure.structureType],
              adresse: structure.adresse,
              departement:
                DEPARTEMENTS_MAP[structure.departement].departmentName ||
                "Non renseigné",
              ville: structure.ville,
              code_postal: structure.codePostal,
              email: structure.email,
              phone: structure.phone,
              responsable_nom: structure.responsable.nom,
              responsable_prenom: structure.responsable.prenom,
              responsable_fonction: structure.responsable.fonction,
              user_nom: user.nom,
              user_prenom: user.prenom,
              user_email: user.email,
              lien_confirmation: lienConfirmation,
              lien_suppression: lienSuppression,
            },
            subject: "Nouvelle structure sur Domifa ",
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
        subject: "Nouvelle structure sur Domifa ",
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
