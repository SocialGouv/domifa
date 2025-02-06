import { IMailDelegate } from "./MailDelegate.interface";

export interface UsagerOptionsTransfert extends IMailDelegate {
  adresse: string | null;
  actif: boolean;
}
