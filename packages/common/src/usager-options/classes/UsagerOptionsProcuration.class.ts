import { MailDelegate } from ".";
import { createDate } from "../../_core";

export class UsagerOptionsProcuration extends MailDelegate {
  public prenom: string;
  public dateNaissance: Date | null;

  constructor(options?: Partial<UsagerOptionsProcuration>) {
    super(options);
    this.prenom = options?.prenom || "";
    this.dateNaissance = createDate(options?.dateNaissance);
  }
}
