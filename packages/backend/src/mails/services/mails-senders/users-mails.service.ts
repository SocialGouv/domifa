import { Injectable } from "@nestjs/common";
import { domifaConfig } from "../../../config";
import {
  AppUserForAdminEmail,
  AppUserForAdminEmailWithTempTokens,
  AppUserTable,
  MessageEmailContentModel,
  MessageEmailTipimailContent,
} from "../../../database";
import { messageEmailSender } from "../_core";

@Injectable()
export class UsersMailsService {
  private domifaAdminMail: string;
  private domifaFromMail: string;

  constructor() {
    this.domifaAdminMail = domifaConfig().email.emailAddressAdmin;
    this.domifaFromMail = domifaConfig().email.emailAddressFrom;
  }

  //
  // Mail pour l'admin de la structure
  //
  public async newUser(admins: AppUserForAdminEmail[], user: AppUserTable) {
    const adminEmails = [];
    const contentEmails: MessageEmailContentModel[] = [];

    admins.map((admin: AppUserForAdminEmail) => {
      adminEmails.push({
        address: admin.email,
        personalName: admin.prenom + " " + admin.nom,
      });

      const frontendUrl = domifaConfig().apps.frontendUrl;
      contentEmails.push({
        email: admin.email,
        subject: "Un nouvel utilisateur souhaite rejoindre votre structure",
        values: {
          admin_prenom: admin.prenom,
          lien: frontendUrl + "admin",
          user_email: user.email,
          user_nom: user.nom,
          user_prenom: user.prenom,
        },
        meta: {},
      });
    });

    const message: MessageEmailTipimailContent = {
      subject: "Un nouvel utilisateur souhaite rejoindre votre structure",
      tipimailTemplateId: "users-nouvel-utilisateur-dans-votre-structure",
      tipimailModels: contentEmails,
      to: adminEmails,
      from: {
        personalName: "Domifa",
        address: this.domifaFromMail,
      },
      replyTo: {
        personalName: "Domifa",
        address: this.domifaAdminMail,
      },
    };

    return messageEmailSender.sendTipimailContentMessageLater(message, {
      emailId: "user-account-activation-pending",
      initialScheduledDate: new Date(),
    });
  }

  //
  // Mail pour l'utilisateur créé par un admin
  //
  public async newUserFromAdmin(user: AppUserForAdminEmailWithTempTokens) {
    const lien =
      domifaConfig().apps.frontendUrl +
      "reset-password/" +
      user.temporaryTokens.password;

    const message: MessageEmailTipimailContent = {
      subject: "Finalisez votre inscription sur Domifa",
      tipimailTemplateId: "users-creation-compte-par-un-admin",
      to: [
        {
          address: user.email,
          personalName: user.prenom + " " + user.nom,
        },
      ],
      tipimailModels: [
        {
          email: user.email,
          values: {
            prenom: user.prenom,
            lien,
          },
          subject: "Finalisez votre inscription sur Domifa",
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

    return messageEmailSender.sendTipimailContentMessageLater(message, {
      emailId: "user-account-created-by-admin",
      initialScheduledDate: new Date(),
    });
  }

  //
  // Mail pour l'utilisateur une fois son compte activé par l'admin
  //
  public async accountActivated(user: AppUserForAdminEmail) {
    const frontendUrl = domifaConfig().apps.frontendUrl;

    const message: MessageEmailTipimailContent = {
      subject: "Votre compte Domifa a été activé",
      tipimailTemplateId: "users-compte-active",
      tipimailModels: [
        {
          email: user.email,
          subject: "Votre compte Domifa a été activé",
          values: {
            lien: frontendUrl + "connexion",
            prenom: user.prenom,
          },
          meta: {},
        },
      ],
      to: [
        {
          address: user.email,
          personalName: user.nom + " " + user.prenom,
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

    return messageEmailSender.sendTipimailContentMessageLater(message, {
      emailId: "user-account-activated",
      initialScheduledDate: new Date(),
    });
  }

  //
  // Mail avec le lien pour réinitialiser son mot de passe
  //
  public async newPassword(user: AppUserForAdminEmailWithTempTokens) {
    const frontendUrl = domifaConfig().apps.frontendUrl;
    const confirmationLink =
      frontendUrl + "reset-password/" + user.temporaryTokens.password;
    const message: MessageEmailTipimailContent = {
      subject: "Demande d'un nouveau mot de passe",
      tipimailTemplateId: "users-nouveau-mot-de-passe",
      tipimailModels: [
        {
          email: user.email,
          subject: "Demande d'un nouveau mot de passe",
          values: {
            lien: confirmationLink,
            prenom: user.prenom,
          },
        },
      ],
      to: [
        {
          address: user.email,
          personalName: user.nom + " " + user.prenom,
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

    return messageEmailSender.sendTipimailContentMessageLater(message, {
      emailId: "user-reset-password",
      initialScheduledDate: new Date(),
    });
  }
}
