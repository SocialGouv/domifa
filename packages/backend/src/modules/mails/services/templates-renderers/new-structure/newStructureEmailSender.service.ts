import { Structure } from "@domifa/common";
import { domifaConfig } from "../../../../../config";
import { MessageEmailContent } from "../../../../../database";
import {
  DOMIFA_DEFAULT_MAIL_CONFIG,
  mailRecipientsFilter,
  messageEmailSender,
} from "../../_core";
import { newStructureEmailRenderer } from "./newStructureEmailRenderer.service";
import { UserForEmail } from "../../../../../_common/model";
const messageEmailId = "new-structure";
export const newStructureEmailSender = { sendMail };

async function sendMail({
  structure,
  user,
}: {
  structure: Structure;
  user: UserForEmail;
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
