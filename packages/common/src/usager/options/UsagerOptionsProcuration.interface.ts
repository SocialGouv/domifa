import { IMailDelegate } from "./MailDelegate.interface";

export interface UsagerOptionsProcuration extends IMailDelegate {
  prenom: string;
  dateNaissance: Date | null;
}
