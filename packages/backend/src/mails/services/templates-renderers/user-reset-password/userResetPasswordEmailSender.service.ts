import {
  MessageEmailContent,
  userSecurityResetPasswordInitiator,
} from "../../../../database";
import { UserStructure } from "../../../../_common/model";
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
  token,
}: {
  user: Pick<UserStructure, "id" | "email" | "prenom" | "nom">;
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
