import { MessageEmailContent } from "../../../../../database";
import { UserStructure } from "@domifa/common";
import {
  DOMIFA_DEFAULT_MAIL_CONFIG,
  mailRecipientsFilter,
  messageEmailSender,
} from "../../_core";
import { userAccountCreatedByAdminEmailRenderer } from "./userAccountCreatedByAdminEmailRenderer.service";
import { UserProfile } from "../../../../../_common/model";
import { userSecurityResetPasswordInitiator } from "../../../../users/services";

export const userAccountCreatedByAdminEmailSender = { sendMail };

const messageEmailId = "user-account-created-by-admin";

async function sendMail({
  user,
  token,
  userProfile,
}: {
  user: Pick<UserStructure, "id" | "email" | "nom" | "prenom">;
  token: string;
  userProfile: UserProfile;
}): Promise<void> {
  const lien = userSecurityResetPasswordInitiator.buildResetPasswordLink({
    token,
    userId: user.id,
    userProfile,
  });

  const to = [
    {
      address: user.email,
      personalName: `${user.prenom} ${user.nom}`,
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
