import { domifaConfig } from "../../../config";
import { MessageEmailRecipient } from "../../../database";

export const DOMIFA_DEFAULT_MAIL_CONFIG: {
  from: MessageEmailRecipient;
  replyTo: MessageEmailRecipient;
} = {
  from: {
    personalName: "Domifa",
    address: domifaConfig().email.emailAddressFrom,
  },
  replyTo: {
    personalName: "Domifa",
    address: domifaConfig().email.emailAddressAdmin,
  },
};
