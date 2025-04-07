import { MessageEmailContent } from "../../../../../database";
import { CommonUser } from "@domifa/common";
import {
  DOMIFA_DEFAULT_MAIL_CONFIG,
  mailRecipientsFilter,
  messageEmailSender,
} from "../../_core";
import { userResetPasswordEmailRenderer } from "./userResetPasswordEmailRenderer.service";
import { UserProfile } from "../../../../../_common/model";
import { userSecurityResetPasswordInitiator } from "../../../../users/services";

export const userResetPasswordEmailSender = { sendMail };

const messageEmailId = "user-reset-password";

async function sendMail({
  user,
  token,
  userProfile,
}: {
  user: Pick<CommonUser, "id" | "email" | "prenom" | "nom">;
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

  const renderedTemplate = await userResetPasswordEmailRenderer.renderTemplate(
    model
  );

  const messageContent: MessageEmailContent = {
    ...DOMIFA_DEFAULT_MAIL_CONFIG,
    ...renderedTemplate,
    to,
    meta: { "lien de ré-initialisation": lien },
  };

  await messageEmailSender.sendMessageLater(messageContent, {
    messageEmailId,
  });
}
