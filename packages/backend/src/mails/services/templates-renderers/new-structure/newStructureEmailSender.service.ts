import { domifaConfig } from "../../../../config";
import {
  AppUserForAdminEmail,
  MessageEmailContent,
} from "../../../../database";
import { StructurePG } from "../../../../_common/model";
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
  structure: StructurePG;
  user: AppUserForAdminEmail;
}): Promise<void> {
  const route = structure.id + "/" + structure.token;
  const frontendUrl = domifaConfig().apps.frontendUrl;
  const lienConfirmation = frontendUrl + "structures/confirm/" + route;

  const lienSuppression = frontendUrl + "structures/delete/" + route;

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
    to: to,
  };

  messageEmailSender.sendMessageLater(messageContent, {
    messageEmailId,
  });
}
