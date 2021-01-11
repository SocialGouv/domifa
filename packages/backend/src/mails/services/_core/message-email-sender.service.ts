import { domifaConfig } from "../../../config";
import {
  MessageContentEmailId,
  MessageEmail,
  MessageEmailContent,
  messageEmailRepository,
  MessageEmailTable,
  MessageEmailTipimailContent,
  MessageEmailTipimailTemplateId,
} from "../../../database";
import { hexEncoder } from "../../../util/encoding";
import { messageEmailConsummerTrigger } from "./message-email-consumer-trigger.service";

export const messageEmailSender = {
  sendMessageLater,
  sendTipimailContentMessageLater,
};
async function sendMessageLater(
  content: MessageEmailContent,
  {
    initialScheduledDate = new Date(),
    emailId,
  }: {
    emailId: MessageContentEmailId;
    initialScheduledDate?: Date;
  }
) {
  return _sendLater(content, {
    initialScheduledDate,
    emailId,
  });
}

async function sendTipimailContentMessageLater(
  content: MessageEmailTipimailContent,
  {
    initialScheduledDate = new Date(),
    emailId,
  }: {
    emailId: MessageEmailTipimailTemplateId;
    initialScheduledDate?: Date;
  }
) {
  return _sendLater(content, {
    initialScheduledDate,
    emailId,
  });
}

async function _sendLater(
  content: MessageEmailContent | MessageEmailTipimailContent,
  {
    initialScheduledDate = new Date(),
    emailId,
  }: Pick<MessageEmail, "initialScheduledDate" | "emailId">
) {
  const attachments = hexEncoder.encode(content.attachments);
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
