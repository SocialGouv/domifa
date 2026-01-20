import { createDate } from "../../_core";
import { IMailDelegate } from "../interfaces";
import { endOfDay, isAfter, isBefore } from "date-fns";

export class MailDelegate implements IMailDelegate {
  public nom: string;
  public dateDebut: Date | null;
  public dateFin: Date | null;
  public isExpired?: boolean;
  public isInactive?: boolean;

  constructor(options?: Partial<IMailDelegate>) {
    this.nom = options?.nom || "";
    // Note: If dateDebut and dateFin are the same day (today),
    // the procuration is considered active (not expired, not inactive)
    this.dateDebut = createDate(options?.dateDebut);
    this.dateFin = createDate(options?.dateFin);

    const today = endOfDay(new Date());

    if (this.dateDebut && !this.dateFin) {
      this.isExpired = false;
    } else if (this.dateDebut && this.dateFin) {
      const startsInFuture = isAfter(this.dateDebut, today);
      const alreadyEnded = isBefore(this.dateFin, today);

      this.isExpired = alreadyEnded;
      this.isInactive = startsInFuture;
    }
  }
}
