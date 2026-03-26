import { formatDateToIso, toUtcNoon } from "../../../shared/date-utils";
import { differenceInCalendarDays, format } from "date-fns";
import { UsagerRdv } from "@domifa/common";

export class Rdv implements UsagerRdv {
  public dateRdv: Date;
  public jourRdv: string;
  public heureRdv: string;
  public userId: number | null;
  public userName: string | null;
  public isNow: boolean;

  constructor(rdv?: UsagerRdv | null) {
    this.isNow = true;
    this.userId = rdv?.userId || null;
    this.userName = rdv?.userName || null;
    this.dateRdv = rdv?.dateRdv ? new Date(rdv.dateRdv) : new Date();
    this.jourRdv = formatDateToIso(toUtcNoon(this.dateRdv));
    this.heureRdv = format(this.dateRdv, "HH:mm");

    if (this.userId) {
      this.isNow = differenceInCalendarDays(this.dateRdv, new Date()) <= 0;
    }
  }
}
