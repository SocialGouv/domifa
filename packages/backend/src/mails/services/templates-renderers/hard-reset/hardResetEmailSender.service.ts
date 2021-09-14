import { MessageEmailContent } from "../../../../database";
import { UserStructure } from "../../../../_common/model";
import {
  DOMIFA_DEFAULT_MAIL_CONFIG,
  mailRecipientsFilter,
  messageEmailSender,
} from "../../_core";
import { hardResetEmailRenderer } from "./hardResetEmailRenderer.service";
const messageEmailId = "hard-reset";
export const hardResetEmailSender = { sendMail };

async function sendMail({
  user,
  confirmationCode,
}: {
  user: Pick<UserStructure, "email" | "nom" | "prenom">;
  confirmationCode: string;
}): Promise<void> {
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
    confirmationCode,
    toSkipString: recipients.toSkipString,
  };

  const renderedTemplate = await hardResetEmailRenderer.renderTemplate(model);

  const messageContent: MessageEmailContent = {
    ...DOMIFA_DEFAULT_MAIL_CONFIG,
    ...renderedTemplate,
    to,
  };

  messageEmailSender.sendMessageLater(messageContent, {
    messageEmailId,
  });
}
