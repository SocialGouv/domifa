import { MessageEmailAttachement } from "./MessageEmailAttachement.type";
import { MessageEmailRecipient } from "./MessageEmailRecipient.type";

export type MessageEmailContent = {
  to: MessageEmailRecipient[];
  from: MessageEmailRecipient;
  replyTo: MessageEmailRecipient;
  subject: string;
  html: string;
  text: string;
  attachments?: MessageEmailAttachement[];
};
