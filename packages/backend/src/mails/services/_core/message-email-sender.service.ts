import { domifaConfig } from "../../../config";
import {
  MessageContentEmailId,
  MessageEmail,
  MessageEmailContent,
  messageEmailRepository,
  MessageEmailTable,
} from "../../../database";

import { messageEmailConsummerTrigger } from "./message-email-consumer-trigger.service";

export const messageEmailSender = {
  sendMessageLater,
};
async function sendMessageLater(
  content: MessageEmailContent,
  {
    initialScheduledDate = new Date(),
    messageEmailId,
  }: {
    messageEmailId: MessageContentEmailId;
    initialScheduledDate?: Date;
  }
) {
  return _sendLater(content, {
    initialScheduledDate,
    emailId: messageEmailId,
  });
}

async function _sendLater(
  content: MessageEmailContent,
  {
    initialScheduledDate = new Date(),
    emailId,
  }: Pick<MessageEmail, "initialScheduledDate" | "emailId">
) {
  const attachments = content.attachments;
  delete content.attachments;
  const messageEmail = new MessageEmailTable({
    status: "pending",
    initialScheduledDate,
    nextScheduledDate: initialScheduledDate,
    emailId,
    content,
    attachments,
  });

  await messageEmailRepository.save(messageEmail);

  if (domifaConfig().cron.emailConsumer.enableSendImmadiately) {
    messageEmailConsummerTrigger.triggerNextSending();
  }
}
