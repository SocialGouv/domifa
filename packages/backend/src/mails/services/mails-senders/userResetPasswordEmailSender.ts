import moment = require("moment");
import { domifaConfig } from "../../../config";
import {
  AppUserForAdminEmailWithTempTokens,
  MessageEmailContent,
} from "../../../database";
import { userResetPasswordEmailRenderer } from "../templates-renderers/user-reset-password/userResetPasswordEmailRenderer.service";
import { DOMIFA_DEFAULT_MAIL_CONFIG, messageEmailSender } from "../_core";

export const userResetPasswordEmailSender = { sendMail };

async function sendMail({
  user,
}: {
  user: AppUserForAdminEmailWithTempTokens;
}): Promise<void> {
  const frontendUrl = domifaConfig().apps.frontendUrl;
  const lien = frontendUrl + "reset-password/" + user.temporaryTokens.password;

  const model = {
    prenom: user.prenom,
    lien,
  };

  const renderedTemplate = await userResetPasswordEmailRenderer.renderTemplate(
    model
  );

  const messageContent: MessageEmailContent = {
    ...DOMIFA_DEFAULT_MAIL_CONFIG,
    ...renderedTemplate,
    to: [
      {
        address: user.email,
        personalName: user.prenom + " " + user.nom,
      },
    ],
  };

  messageEmailSender.sendMessageLater(messageContent, {
    emailId: "user-reset-password",
  });
}
