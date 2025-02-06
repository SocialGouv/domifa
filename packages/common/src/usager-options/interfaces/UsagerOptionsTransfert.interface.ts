import { IMailDelegate } from "./IMailDelegate.interface";

export interface UsagerOptionsTransfert extends IMailDelegate {
  adresse: string | null;
  actif: boolean;
}
