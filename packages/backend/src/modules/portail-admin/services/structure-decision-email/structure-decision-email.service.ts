import { Injectable } from "@nestjs/common";
import { BrevoSenderService } from "../../../mails/services/brevo-sender/brevo-sender.service";
import { domifaConfig } from "../../../../config";
import {
  StructureDecisionStatut,
  UserDeleteMotif,
  USER_DELETE_MOTIF_LABELS,
} from "@domifa/common";

interface EmailParams {
  prenom: string;
  motif: string;
}

@Injectable()
export class StructureDecisionEmailService {
  constructor(private readonly brevoSenderService: BrevoSenderService) {}

  async sendDecisionEmail(
    statut: StructureDecisionStatut,
    adminEmail: string,
    adminName: string,
    params: EmailParams
  ): Promise<void> {
    const templateId = this.getTemplateId(statut);

    await this.brevoSenderService.sendEmailWithTemplate({
      templateId,
      to: [{ email: adminEmail, name: adminName }],
      params,
    });
  }

  async sendUserAccountDeletedEmail({
    email,
    prenom,
    motif,
  }: {
    email: string;
    prenom: string;
    motif: UserDeleteMotif;
  }): Promise<void> {
    await this.brevoSenderService.sendEmailWithTemplate({
      templateId: domifaConfig().brevo.templates.userAccountDeleted,
      to: [{ email, name: prenom }],
      params: {
        prenom,
        motif: USER_DELETE_MOTIF_LABELS[motif],
      },
    });
  }

  private getTemplateId(statut: StructureDecisionStatut): number {
    switch (statut) {
      case "VALIDE":
        return domifaConfig().brevo.templates.userAccountActivated;
      case "SUPPRIME":
        return domifaConfig().brevo.templates.structureDelete;
      case "REFUS":
        return domifaConfig().brevo.templates.structureRefusal;
      default:
        throw new Error(`Unknown statut: ${statut}`);
    }
  }
}
