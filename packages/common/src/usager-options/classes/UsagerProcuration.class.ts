import { MailDelegate } from ".";
import { createDate } from "../../_core";
import { UsagerOptionsProcuration } from "../interfaces";

export class UsagerProcuration
  extends MailDelegate
  implements UsagerOptionsProcuration
{
  public prenom: string;
  public dateNaissance: Date | null;

  constructor(options?: Partial<UsagerOptionsProcuration>) {
    super(options);
    this.prenom = options?.prenom || "";
    this.dateNaissance = createDate(options?.dateNaissance);
  }
}
