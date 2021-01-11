import { MessageEmailAttachement } from "./MessageEmailAttachement.type";
import { MessageEmailIcalEvent } from "./MessageEmailIcalEvent.type";
import { MessageEmailRecipient } from "./MessageEmailRecipient.type";

export type MessageEmailContent = {
  to: MessageEmailRecipient[];
  from: MessageEmailRecipient;
  replyTo: MessageEmailRecipient;
  subject: string;
  html: string;
  text: string;
  icalEvent?: MessageEmailIcalEvent;
  attachments?: MessageEmailAttachement[];
};
