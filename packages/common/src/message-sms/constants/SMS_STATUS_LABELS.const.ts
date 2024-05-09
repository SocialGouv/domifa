import { type MessageSmsStatus } from "../types";

export const SMS_STATUS_LABELS: {
  [key in MessageSmsStatus]: string;
} = {
  TO_SEND: "Envoi prévu",
  ON_HOLD: "Envoi effectué",
  SENT_AND_RECEIVED: "Envoyé et reçu",
  SENT_AND_NOT_RECEIVED: "Envoyé et non reçu",
  IN_PROGRESS: "Envoi en cours",
  FAILURE: "Envoi échoué",
  DISABLED: "Envoi désactivé",
  EXPIRED: "Envoi désactivé",
};
