import { UserStructure } from "@domifa/common";
import {
  DOMIFA_DEFAULT_MAIL_CONFIG,
  mailRecipientsFilter,
  messageEmailSender,
} from "../../_core";
import { userAccountActivatedEmailRenderer } from "./userAccountActivatedEmailRenderer.service";
import { domifaConfig } from "../../../../../config";
import { MessageEmailContent } from "../../../../../database";
const messageEmailId = "user-account-activated";

export const userAccountActivatedEmailSender = { sendMail };

async function sendMail({
  user,
}: {
  user: Pick<UserStructure, "email" | "nom" | "prenom">;
}): Promise<void> {
  const lien = domifaConfig().apps.frontendUrl + "connexion";

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
    await userAccountActivatedEmailRenderer.renderTemplate(model);
  const messageContent: MessageEmailContent = {
    ...DOMIFA_DEFAULT_MAIL_CONFIG,
    ...renderedTemplate,
    to,
  };

  messageEmailSender.sendMessageLater(messageContent, {
    messageEmailId,
  });
}
