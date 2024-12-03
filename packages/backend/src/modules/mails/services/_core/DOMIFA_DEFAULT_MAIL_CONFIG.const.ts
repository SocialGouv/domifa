import { domifaConfig } from "../../../../config";
import { MessageEmailRecipient } from "../../../../database";

export const DOMIFA_DEFAULT_MAIL_CONFIG: {
  from: MessageEmailRecipient;
  replyTo: MessageEmailRecipient;
} = {
  from: {
    personalName: "DomiFa",
    address: domifaConfig().email.emailAddressFrom,
  },
  replyTo: {
    personalName: "DomiFa",
    address: domifaConfig().email.emailAddressAdmin,
  },
};
