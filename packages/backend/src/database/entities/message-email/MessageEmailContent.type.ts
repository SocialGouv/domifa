import { MessageEmailContentModel } from "./MessageEmailContentModel.type";
import { MessageEmailRecipient } from "./MessageEmailRecipient.type";

export type MessageEmailContent = {
  to: MessageEmailRecipient[];
  from: MessageEmailRecipient;
  replyTo: MessageEmailRecipient;
  subject: string;
  tipimailTemplateId: string; // https://app.tipimail.com/#/app/settings/templates ATTENTION, si on modifie la description d'un template sur tipimail, l'id change automatiquement
  tipimailModels: MessageEmailContentModel[];
  // attachments?: [
  //   {
  //     contentType: string;
  //     filename: string;
  //     content: any;
  //   }
  // ];
};
