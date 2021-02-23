import { domifaConfig } from "../../../../config";
import {
  AppUserForAdminEmailWithTempTokens,
  MessageEmailContent,
} from "../../../../database";
import {
  DOMIFA_DEFAULT_MAIL_CONFIG,
  mailRecipientsFilter,
  messageEmailSender,
} from "../../_core";
import { userResetPasswordEmailRenderer } from "./userResetPasswordEmailRenderer.service";

export const userResetPasswordEmailSender = { sendMail };

const messageEmailId = "user-reset-password";

async function sendMail({
  user,
}: {
  user: AppUserForAdminEmailWithTempTokens;
}): Promise<void> {
  const frontendUrl = domifaConfig().apps.frontendUrl;
  const lien = frontendUrl + "reset-password/" + user.temporaryTokens.password;

  const to = [
    {
      address: user.email,
      personalName: user.prenom + " " + user.nom,
    },
  ];

  const recipients = mailRecipientsFilter.filterRecipients(to, {
    logEnabled: false,
  });

  const model = {
    prenom: user.prenom,
    lien,
    toSkipString: recipients.toSkipString,
  };

  const renderedTemplate = await userResetPasswordEmailRenderer.renderTemplate(
    model
  );

  const messageContent: MessageEmailContent = {
    ...DOMIFA_DEFAULT_MAIL_CONFIG,
    ...renderedTemplate,
    to,
  };

  messageEmailSender.sendMessageLater(messageContent, {
    messageEmailId,
  });
}
