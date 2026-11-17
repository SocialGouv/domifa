import { Injectable } from "@nestjs/common";
import { BrevoSenderService } from "../../../mails/services/brevo-sender/brevo-sender.service";
import { domifaConfig } from "../../../../config";
import { StructureDecisionStatut } from "@domifa/common";

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
