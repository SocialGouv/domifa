import { MailDelegate } from ".";

export class UsagerOptionsTransfert extends MailDelegate {
  public adresse: string | null;
  public actif: boolean;

  constructor(transfert?: Partial<UsagerOptionsTransfert>) {
    super(transfert);
    this.adresse = transfert?.adresse ?? null;
    this.actif =
      transfert?.actif ?? (!!transfert?.nom && transfert?.nom !== "");
  }
}
