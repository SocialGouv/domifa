import { domifaConfig } from "../../../../config";
import { MessageEmailContent } from "../../../../database";
import { AppUser } from "../../../../_common/model";
import {
  DOMIFA_DEFAULT_MAIL_CONFIG,
  mailRecipientsFilter,
  messageEmailSender,
} from "../../_core";
import { userAccountCreatedByAdminEmailRenderer } from "./userAccountCreatedByAdminEmailRenderer.service";

export const userAccountCreatedByAdminEmailSender = { sendMail };

const messageEmailId = "user-account-created-by-admin";

async function sendMail({
  user,
}: {
  user: Pick<AppUser, "email" | "nom" | "prenom" | "temporaryTokens">;
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

  const renderedTemplate = await userAccountCreatedByAdminEmailRenderer.renderTemplate(
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
