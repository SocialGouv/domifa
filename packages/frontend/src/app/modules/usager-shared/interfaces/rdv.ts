import { UsagerRdv } from "./../../../../_common/model/usager/UsagerRdv.type";
import { formatDateToNgb } from "../../../shared/bootstrap-util";
import { format } from "date-fns";

export class Rdv implements UsagerRdv {
  public dateRdv: Date;
  public jourRdv: {
    day: number;
    month: number;
    year: number;
  };
  public heureRdv: string;
  public userId: number;
  public userName: string;
  public isNow: boolean;

  constructor(rdv?: Partial<UsagerRdv>) {
    this.isNow = true;

    this.userId = (rdv && rdv.userId) || null;
    this.userName = (rdv && rdv.userName) || null;

    this.dateRdv = rdv && rdv.dateRdv ? new Date(rdv.dateRdv) : new Date();

    this.jourRdv = formatDateToNgb(this.dateRdv);
    this.heureRdv = format(this.dateRdv, "HH:mm");
  }
}
