import { createDate } from "../../_core";
import { IMailDelegate } from "../interfaces";
import { endOfDay, isBefore } from "date-fns";

export class MailDelegate implements IMailDelegate {
  public nom: string;
  public dateDebut: Date | null;
  public dateFin: Date | null;
  public isExpired?: boolean;

  constructor(options?: Partial<IMailDelegate>) {
    this.nom = options?.nom || "";
    this.dateDebut = createDate(options?.dateDebut);
    this.dateFin = createDate(options?.dateFin);

    if (!this?.dateFin) {
      this.isExpired = false;
    } else {
      this.isExpired = isBefore(this.dateFin, endOfDay(new Date()));
    }
  }
}
