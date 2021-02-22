import moment = require("moment");
import { domifaConfig } from "../../../config";
import { AppUserForAdminEmail, MessageEmailContent } from "../../../database";
import { StructurePG } from "../../../_common/model";
import { newStructureEmailRenderer } from "../templates-renderers";
import { DOMIFA_DEFAULT_MAIL_CONFIG, messageEmailSender } from "../_core";

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

  const renderedTemplate = await newStructureEmailRenderer.renderTemplate({
    user,
    structure,
    lienConfirmation,
    lienSuppression,
  });

  const messageContent: MessageEmailContent = {
    ...DOMIFA_DEFAULT_MAIL_CONFIG,
    ...renderedTemplate,
    to: [
      {
        address: domifaConfig().email.emailAddressAdmin,
        personalName: "Domifa",
      },
    ],
  };

  messageEmailSender.sendMessageLater(messageContent, {
    emailId: "new-structure",
  });
}
