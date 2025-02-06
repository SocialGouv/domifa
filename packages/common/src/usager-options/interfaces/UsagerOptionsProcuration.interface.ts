import { IMailDelegate } from "./IMailDelegate.interface";

export interface UsagerOptionsProcuration extends IMailDelegate {
  prenom: string;
  dateNaissance: Date | null;
}
