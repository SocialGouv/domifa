import { ContactSupport } from "../../../../../_common/model";
import { domifaConfig } from "../../../../../config";
import {
  MessageEmailAttachment,
  MessageEmailContent,
} from "../../../../../database";
import { appLogger } from "../../../../../util";
import { messageEmailSender } from "../../_core";
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
      personalName: "DomiFa",
    },
  ];
  const subject = `[SUPPORT] ${model.subject} - ${model.name}`;

  const attachments: MessageEmailAttachment[] = model.attachment
    ? [model.attachment]
    : [];

  const renderedTemplate = await contactSupportEmailRenderer.renderTemplate({
    structureId: model.structureId,
    content: model.content,
    email: model.email,
    name: model.name,
    subject,
    structureName: model.structureName,
  });

  const messageContent: MessageEmailContent = {
    from: {
      personalName: model.name,
      address: model.email,
    },
    subject,
    replyTo: {
      personalName: model.name,
      address: model.email,
    },
    ...renderedTemplate,
    to,
    attachments,
  };

  await messageEmailSender.sendMessageLater(messageContent, {
    messageEmailId,
  });
}
