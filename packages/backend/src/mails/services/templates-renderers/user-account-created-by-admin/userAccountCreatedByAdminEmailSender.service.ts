import {
  MessageEmailContent,
  userStructureSecurityResetPasswordInitiator,
} from "../../../../database";
import { UserStructure } from "../../../../_common/model";
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
  user: Pick<UserStructure, "id" | "email" | "nom" | "prenom">;
  token: string;
}): Promise<void> {
  const lien =
    userStructureSecurityResetPasswordInitiator.buildResetPasswordLink({
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

  const renderedTemplate =
    await userAccountCreatedByAdminEmailRenderer.renderTemplate(model);
  const messageContent: MessageEmailContent = {
    ...DOMIFA_DEFAULT_MAIL_CONFIG,
    ...renderedTemplate,
    to,
    meta: { "lien de connection": lien },
  };

  messageEmailSender.sendMessageLater(messageContent, {
    messageEmailId,
  });
}
