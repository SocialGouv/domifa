import { domifaConfig } from "../../../../config";
import {
  AppUserForAdminEmail,
  MessageEmailContent,
} from "../../../../database";
import { AppUser } from "../../../../_common/model";
import {
  DOMIFA_DEFAULT_MAIL_CONFIG,
  mailRecipientsFilter,
  messageEmailSender,
} from "../../_core";
import { userAccountCreatedEmailRenderer } from "./userAccountCreatedEmailRenderer.service";

export const userAccountCreatedEmailSender = { sendMail };

const messageEmailId = "user-account-created";

async function sendMail({
  user,
  admins,
}: {
  user: Pick<AppUser, "email" | "nom" | "prenom">;
  admins: AppUserForAdminEmail[];
}): Promise<void> {
  const frontendUrl = domifaConfig().apps.frontendUrl;
  const lien = frontendUrl + "admin";

  for (const admin of admins) {
    const to = [
      {
        address: admin.email,
        personalName: admin.prenom + " " + admin.nom,
      },
    ];

    const recipients = mailRecipientsFilter.filterRecipients(to, {
      logEnabled: false,
    });

    const model = {
      admin_prenom: admin.prenom,
      user_email: user.email,
      user_nom: user.nom,
      user_prenom: user.prenom,
      lien,
      toSkipString: recipients.toSkipString,
    };

    const renderedTemplate = await userAccountCreatedEmailRenderer.renderTemplate(
      model
    );

    const messageContent: MessageEmailContent = {
      ...DOMIFA_DEFAULT_MAIL_CONFIG,
      ...renderedTemplate,
      to: to,
    };

    messageEmailSender.sendMessageLater(messageContent, {
      messageEmailId,
    });
  }
}
