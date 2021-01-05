import { formatDateToNgb } from "../../../shared/bootstrap-util";

export class Rdv {
  public dateRdv: Date;
  public jourRdv: {
    day: number;
    month: number;
    year: number;
  };
  public heureRdv: {
    hour: number;
    minute: number;
  };

  public userId: string;
  public userName: string;
  public isNow: boolean;

  constructor(rdv?: any) {
    const today = new Date();
    this.dateRdv = today;

    if (rdv && rdv.dateRdv) {
      this.dateRdv = new Date(rdv.dateRdv);
    }

    this.jourRdv = formatDateToNgb(this.dateRdv);
    this.heureRdv = {
      hour: this.dateRdv.getHours(),
      minute: this.dateRdv.getMinutes(),
    };

    this.userId = (rdv && rdv.userId) || null;
    this.userName = (rdv && rdv.userName) || null;

    this.isNow = true;
    if (this.dateRdv !== today) {
      this.isNow = this.dateRdv <= today;
    }
  }
}
