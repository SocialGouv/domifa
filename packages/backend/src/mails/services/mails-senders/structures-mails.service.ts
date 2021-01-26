import { Injectable } from "@nestjs/common";
import { domifaConfig } from "../../../config";
import { MessageEmailTipimailContent } from "../../../database";
import { StructureCommon, UserProfile } from "../../../_common/model";
import { messageEmailSender } from "../_core";

@Injectable()
export class StructuresMailsService {
  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor() {
    this.domifaAdminMail = domifaConfig().email.emailAddressAdmin;
    this.domifaFromMail = domifaConfig().email.emailAddressFrom;
  }

  public async confirmationStructure(
    structure: StructureCommon,
    user: UserProfile
  ): Promise<void> {
    const frontendUrl = domifaConfig().apps.frontendUrl;

    const message: MessageEmailTipimailContent = {
      subject: "Votre compte Domifa a été activé",
      tipimailTemplateId: "users-compte-active",
      tipimailModels: [
        {
          email: user.email,
          values: {
            lien: frontendUrl,
            nom_structure: structure.nom,
            prenom: user.prenom,
          },
          subject: "Votre compte Domifa a été activé",
          meta: {},
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
      to: [
        {
          address: user.email,
          personalName: user.prenom + " " + user.nom,
        },
      ],
    };

    await messageEmailSender.sendTipimailContentMessageLater(message, {
      emailId: "user-account-activated",
      initialScheduledDate: new Date(),
    });
  }
}
