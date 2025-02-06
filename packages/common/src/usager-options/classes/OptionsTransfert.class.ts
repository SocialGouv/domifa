import { MailDelegate } from ".";
import { UsagerOptionsTransfert } from "../interfaces";

export class OptionsTransfert
  extends MailDelegate
  implements UsagerOptionsTransfert
{
  public adresse: string | null;
  public actif: boolean;

  constructor(transfert?: Partial<UsagerOptionsTransfert>) {
    super(transfert);
    this.adresse = transfert?.adresse ?? null;
    this.actif =
      transfert?.actif ?? (!!transfert?.nom && transfert?.nom !== "");
  }
}
