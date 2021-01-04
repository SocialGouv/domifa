import { Injectable } from "@nestjs/common";
import * as moment from "moment";
import { domifaConfig } from "../../config";
import { AppUserForAdminEmail, MessageEmailContent } from "../../database";
import { Usager } from "../../usagers/interfaces/usagers";
import { MessageEmailSender } from "./message-email-sender.service";

@Injectable()
export class UsagersMailsService {
  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor(private messageEmailSender: MessageEmailSender) {
    this.domifaAdminMail = domifaConfig().email.emailAddressAdmin;
    this.domifaFromMail = domifaConfig().email.emailAddressFrom;
  }

  public async mailRdv(
    user: AppUserForAdminEmail,
    usager: Usager,
    event: any,
    message: string
  ) {
    const prenomUsager =
      (usager.sexe === "homme" ? "M. " : "Mme. ") +
      usager.nom +
      " " +
      usager.prenom;

    const date = moment(new Date(usager.rdv.dateRdv)).locale("fr").format("L");
    const heure = moment(new Date(usager.rdv.dateRdv))
      .locale("fr")
      .format("LT");

    const datas = {
      prenom: user.prenom,
      usager: prenomUsager,
      date,
      heure,
      message,
    };

    const messageContent: MessageEmailContent = {
      subject: "Prise de rendez-vous entre le demandeur et un collaborateur",
      tipimailTemplateId: "usagers-prise-de-rendez-vous",
      tipimailModels: [
        {
          email: user.email,
          values: datas,
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
      attachments: [
        {
          contentType: "text/calendar",
          filename: "invitation.ics",
          content: event,
        },
      ],
    };

    await this.messageEmailSender.sendMailLater(messageContent, {
      emailId: "usager-appointment-created",
      initialScheduledDate: new Date(),
    });
  }

  public async hardReset(user: AppUserForAdminEmail, token: string) {
    const message: MessageEmailContent = {
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

    await this.messageEmailSender.sendMailLater(message, {
      emailId: "structure-hard-reset",
      initialScheduledDate: new Date(),
    });
  }
}
