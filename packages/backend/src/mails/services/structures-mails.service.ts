import { Injectable } from "@nestjs/common";
import { domifaConfig } from "../../config";
import { MessageEmailContent } from "../../database";
import { Structure } from "../../structures/structure-interface";
import { UserProfile } from "../../_common/model";
import { MessageEmailSender } from "./message-email-sender.service";

@Injectable()
export class StructuresMailsService {
  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor(private messageEmailSender: MessageEmailSender) {
    this.domifaAdminMail = domifaConfig().email.emailAddressAdmin;
    this.domifaFromMail = domifaConfig().email.emailAddressFrom;
  }

  public async confirmationStructure(
    structure: Structure,
    user: UserProfile
  ): Promise<any> {
    const frontendUrl = domifaConfig().apps.frontendUrl;

    const message: MessageEmailContent = {
      subject: "Votre compte Domifa a été activé",
      tipimailTemplateId: "users-compte-active",
      tipimailModel: {
        email: user.email,
        values: {
          lien: frontendUrl,
          nom_structure: structure.nom,
          prenom: user.prenom,
        },
        subject: "Votre compte Domifa a été activé",
        meta: {},
      },
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

    await this.messageEmailSender.sendMailLater(message, {
      emailId: "user-account-activated",
      initialScheduledDate: new Date(),
    });
  }
}
