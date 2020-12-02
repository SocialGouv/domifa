import { Injectable } from "@nestjs/common";
import { domifaConfig } from "../../config";
import { AppUserForAdminEmail, MessageEmailContent } from "../../database";
import { DEPARTEMENTS_MAP } from "../../structures/DEPARTEMENTS_MAP.const";
import { Structure } from "../../structures/structure-interface";
import { MessageEmailSender } from "./message-email-sender.service";

@Injectable()
export class DomifaMailsService {
  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor(private messageEmailSender: MessageEmailSender) {
    this.domifaAdminMail = domifaConfig().email.emailAddressAdmin;
    this.domifaFromMail = domifaConfig().email.emailAddressFrom;
  }

  //
  // Indiquer la création d'une structure à l'équipe Domifa
  //
  public async newStructure(structure: Structure, user: AppUserForAdminEmail) {
    const route = structure._id + "/" + structure.token;
    const frontendUrl = domifaConfig().apps.frontendUrl;
    const lienConfirmation = frontendUrl + "structures/confirm/" + route;

    const lienSuppression = frontendUrl + "structures/delete/" + route;

    const structureTypes = {
      asso: "Organisme agrée",
      ccas: "CCAS",
      cias: "CIAS",
    };

    const message: MessageEmailContent = {
      subject: "Nouvelle structure sur Domifa ",
      tipimailTemplateId: "domifa-nouvelle-structure",
      tipimailModel: {
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
      to: [
        {
          address: this.domifaAdminMail,
          personalName: "Domifa",
        },
      ],
      from: {
        personalName: "Domifa",
        address: this.domifaFromMail,
      },
      replyTo: {
        personalName: "Domifa",
        address: this.domifaAdminMail,
      },
    };

    await this.messageEmailSender.sendMailLater(message, {
      emailId: "structure-created",
      initialScheduledDate: new Date(),
    });
  }

  //
  // Demande de suppression d'une structure à l'équipe Domifa
  //
  public async deleteStructure(structure: Structure) {
    const lien =
      domifaConfig().apps.frontendUrl +
      "structures/delete/" +
      structure._id +
      "/" +
      structure.token;

    const message: MessageEmailContent = {
      subject: "Supprimer une structure sur Domifa",
      tipimailTemplateId: "domifa-supprimer-structure",
      tipimailModel: {
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
      to: [
        {
          address: this.domifaAdminMail,
          personalName: "Domifa",
        },
      ],
      from: {
        personalName: "Domifa",
        address: this.domifaFromMail,
      },
      replyTo: {
        personalName: "Domifa",
        address: this.domifaAdminMail,
      },
    };

    await this.messageEmailSender.sendMailLater(message, {
      emailId: "structure-delete",
      initialScheduledDate: new Date(),
    });
  }
}
