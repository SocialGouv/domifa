import { ContactSupport } from "../../../../_common/model/contact-support/ContactSupport.type";
import { domifaConfig } from "../../../../config";
import { MessageEmailContent } from "../../../../database";
import { appLogger } from "../../../../util";
import { DOMIFA_DEFAULT_MAIL_CONFIG, messageEmailSender } from "../../_core";
import { contactSupportEmailRenderer } from "./contactSupportEmailRenderer.service";

const messageEmailId = "contact-support";
export const contactSupportEmailSender = { sendMail };

async function sendMail(model: ContactSupport): Promise<void> {
  appLogger.warn(
    `Sending email contact to ${domifaConfig().email.emailAddressAdmin}`
  );

  const to = [
    {
      address: domifaConfig().email.emailAddressAdmin,
      personalName: "Domifa",
    },
  ];

  const renderedTemplate = await contactSupportEmailRenderer.renderTemplate({
    structureId: model.structureId,
    content: model.content,
    file: model.file,
    email: model.email,
    name: model.name,
  });

  const messageContent: MessageEmailContent = {
    ...DOMIFA_DEFAULT_MAIL_CONFIG,
    ...renderedTemplate,
    to,
  };

  await messageEmailSender.sendMessageLater(messageContent, {
    messageEmailId,
  });
}
