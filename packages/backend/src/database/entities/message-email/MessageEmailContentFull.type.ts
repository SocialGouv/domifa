import { MessageEmailRecipient } from "./MessageEmailRecipient.type";

export type MessageEmailContentFull = {
  to: MessageEmailRecipient[];
  from: MessageEmailRecipient;
  replyTo: MessageEmailRecipient;
  subject: string;
  html: string;
  text: string;
};
