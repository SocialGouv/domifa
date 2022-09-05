import { MessageEmailRecipient } from "./MessageEmailRecipient.type";

export type MessageEmailSendDetails = {
  sent: MessageEmailRecipient[];
  skipped: MessageEmailRecipient[];
  serverResponse: string;
};
