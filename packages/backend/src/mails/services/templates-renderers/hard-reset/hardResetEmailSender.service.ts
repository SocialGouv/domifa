import { MessageEmailContent } from "../../../../database";
import { AppUser } from "../../../../_common/model";
import { DOMIFA_DEFAULT_MAIL_CONFIG, messageEmailSender } from "../../_core";
import { hardResetEmailRenderer } from "./hardResetEmailRenderer.service";

export const hardResetEmailSender = { sendMail };

async function sendMail({
  user,
  confirmationCode,
}: {
  user: Pick<AppUser, "email" | "nom" | "prenom">;
  confirmationCode: string;
}): Promise<void> {
  const model = {
    prenom: user.prenom,
    confirmationCode,
  };

  const renderedTemplate = await hardResetEmailRenderer.renderTemplate(model);

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
    emailId: "hard-reset",
  });
}
