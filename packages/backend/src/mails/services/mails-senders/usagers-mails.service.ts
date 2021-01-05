import { Injectable } from "@nestjs/common";
import { domifaConfig } from "../../../config";
import {
  AppUserForAdminEmail,
  MessageEmailTipimailContent,
} from "../../../database";
import { messageEmailSender } from "../_core";

@Injectable()
export class UsagersMailsService {
  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor() {
    this.domifaAdminMail = domifaConfig().email.emailAddressAdmin;
    this.domifaFromMail = domifaConfig().email.emailAddressFrom;
  }

  public async hardReset(user: AppUserForAdminEmail, token: string) {
    const message: MessageEmailTipimailContent = {
      subject: "Code de confirmation Domifa pour supprimer les usagers",
      tipimailTemplateId: "usagers-hard-reset",
      tipimailModels: [
        {
          email: user.email,
          values: { code: token, prenom: user.prenom },
          subject: "Code de confirmation Domifa pour supprimer les usagers",
          meta: {},
        },
      ],
      to: [
        {
          address: user.email,
          personalName: user.prenom + " " + user.nom,
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
      emailId: "structure-hard-reset",
      initialScheduledDate: new Date(),
    });
  }
}
