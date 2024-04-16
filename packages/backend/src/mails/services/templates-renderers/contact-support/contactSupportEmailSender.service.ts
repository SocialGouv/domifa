import { ContactSupport } from "../../../../_common/model/contact-support/ContactSupport.type";
import { domifaConfig } from "../../../../config";
import { MessageEmailContent } from "../../../../database";
import { appLogger } from "../../../../util";
import { DOMIFA_DEFAULT_MAIL_CONFIG, messageEmailSender } from "../../_core";
import { contactSupportEmailRenderer } from "./contactSupportEmailRenderer.service";
import { MessageEmailAttachment } from "../../../../database/entities/message-email/MessageEmailAttachment.type";

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

  const attachments: MessageEmailAttachment[] = model.attachment
    ? [model.attachment]
    : [];

  const renderedTemplate = await contactSupportEmailRenderer.renderTemplate({
    structureId: model.structureId,
    content: model.content,
    email: model.email,
    name: model.name,
    structureName: model.structureName,
  });

  const messageContent: MessageEmailContent = {
    ...DOMIFA_DEFAULT_MAIL_CONFIG,
    ...renderedTemplate,
    to,
    attachments,
    replyTo: { personalName: model.name, address: model.email },
  };

  await messageEmailSender.sendMessageLater(messageContent, {
    messageEmailId,
  });
}
