import { MessageSmsSendErrors } from ".";

export type MessageSmsSendResponse = {
  resultat: number;
  id?: string;
  erreurs?: MessageSmsSendErrors;
};
