import { Injectable } from "@nestjs/common";
import { domifaConfig } from "../../../config";
import {
  MessageEmailTipimailContent
} from "../../../database";
import { StructurePG } from "../../../_common/model";
import { messageEmailSender } from "../_core";

@Injectable()
export class DomifaMailsService {
  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor() {
    this.domifaAdminMail = domifaConfig().email.emailAddressAdmin;
    this.domifaFromMail = domifaConfig().email.emailAddressFrom;
  }

  //
  // Demande de suppression d'une structure à l'équipe Domifa
  //
  public async sendMailConfirmDeleteStructure(structure: StructurePG) {
    const lien =
      domifaConfig().apps.frontendUrl +
      "structures/delete/" +
      structure.id +
      "/" +
      structure.token;

    const message: MessageEmailTipimailContent = {
      subject: "Supprimer une structure sur Domifa",
      tipimailTemplateId: "domifa-supprimer-structure",
      tipimailModels: [
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

    await messageEmailSender.sendTipimailContentMessageLater(message, {
      emailId: "structure-delete",
      initialScheduledDate: new Date(),
    });
  }
}
