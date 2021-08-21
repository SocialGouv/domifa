import { domifaConfig } from "../../../../config";
import { MessageEmailContent } from "../../../../database";
import { Structure } from "../../../../_common/model";
import {
  DOMIFA_DEFAULT_MAIL_CONFIG,
  mailRecipientsFilter,
  messageEmailSender,
} from "../../_core";
import { deleteStructureEmailRenderer } from "./deleteStructureEmailRenderer.service";

const messageEmailId = "delete-structure";
export const deleteStructureEmailSender = { sendMail };

async function sendMail({
  structure,
}: {
  structure: Structure;
}): Promise<void> {
  const frontendUrl = domifaConfig().apps.frontendUrl;

  const lienSuppression =
    frontendUrl + "structures/delete/" + structure.id + "/" + structure.token;

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
    structure,
    lienSuppression,
    toSkipString: recipients.toSkipString,
  };
  const renderedTemplate = await deleteStructureEmailRenderer.renderTemplate(
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
