import { domifaConfig } from "../../../../config";
import { MessageEmailContent } from "../../../../database";
import { StructurePG } from "../../../../_common/model";
import { DOMIFA_DEFAULT_MAIL_CONFIG, messageEmailSender } from "../../_core";
import { deleteStructureEmailRenderer } from "./deleteStructureEmailRenderer.service";

export const deleteStructureEmailSender = { sendMail };

async function sendMail({
  structure,
}: {
  structure: StructurePG;
}): Promise<void> {
  const frontendUrl = domifaConfig().apps.frontendUrl;

  const lienSuppression =
    frontendUrl + "structures/delete/" + structure.id + "/" + structure.token;

  const renderedTemplate = await deleteStructureEmailRenderer.renderTemplate({
    structure,
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
    emailId: "delete-structure",
  });
}
