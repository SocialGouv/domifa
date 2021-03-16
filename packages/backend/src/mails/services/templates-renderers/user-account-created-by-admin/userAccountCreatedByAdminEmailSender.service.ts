import {
  MessageEmailContent,
  userSecurityResetPasswordInitiator,
} from "../../../../database";
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
  token,
}: {
  user: Pick<AppUser, "id" | "email" | "nom" | "prenom">;
  token: string;
}): Promise<void> {
  const lien = userSecurityResetPasswordInitiator.buildResetPasswordLink({
    token,
    userId: user.id,
  });

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
