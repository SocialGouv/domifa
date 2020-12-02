import { MessageEmailRecipient } from "./MessageEmailRecipient.type";

export type MessageEmailContent = {
  to: MessageEmailRecipient[];
  from: MessageEmailRecipient;
  replyTo: MessageEmailRecipient;
  subject: string;
  tipimailTemplateId: string;
  tipimailModel: { [attr: string]: any };
};
