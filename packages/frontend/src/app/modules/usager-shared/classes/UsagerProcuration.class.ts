import { UsagerOptionsProcuration } from "@domifa/common";
import { MailDelegate } from ".";
import { createDate } from "../../../shared";

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
