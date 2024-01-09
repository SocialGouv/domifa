import { domifaConfig } from "../../../../config";
import {
  AppUserForAdminEmail,
  MessageEmailContent,
} from "../../../../database";
import { Structure } from "@domifa/common";

import {
  DOMIFA_DEFAULT_MAIL_CONFIG,
  mailRecipientsFilter,
  messageEmailSender,
} from "../../_core";
import { newStructureEmailRenderer } from "./newStructureEmailRenderer.service";
const messageEmailId = "new-structure";
export const newStructureEmailSender = { sendMail };

async function sendMail({
  structure,
  user,
}: {
  structure: Structure;
  user: AppUserForAdminEmail;
}): Promise<void> {
  const parameters = `${structure.uuid}/${structure.token}`;
  const portailAdminUrl = domifaConfig().apps.portailAdminUrl;
  const lienConfirmation = `${portailAdminUrl}structures-confirm/enable/${parameters}`;
  const lienSuppression = `${portailAdminUrl}structures-confirm/delete/${parameters}`;

  const to = [
    {
      address: domifaConfig().email.emailAddressAdmin,
      personalName: "Domifa",
    },
  ];

  const recipients = mailRecipientsFilter.filterRecipients(to, {
    logEnabled: false,
  });

  const model = {
    user,
    structure,
    lienConfirmation,
    lienSuppression,
    toSkipString: recipients.toSkipString,
  };

  const renderedTemplate = await newStructureEmailRenderer.renderTemplate(
    model
  );
  const messageContent: MessageEmailContent = {
    ...DOMIFA_DEFAULT_MAIL_CONFIG,
    ...renderedTemplate,
    to,
    meta: {
      "lien confirmation": lienConfirmation,
      "lien suppression": lienSuppression,
    },
  };

  messageEmailSender.sendMessageLater(messageContent, {
    messageEmailId,
  });
}
