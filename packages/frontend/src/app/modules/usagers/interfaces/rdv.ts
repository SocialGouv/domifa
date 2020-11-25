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
    this.dateRdv = (rdv && new Date(rdv.dateRdv)) || today;

    this.jourRdv =
      rdv && rdv.dateRdv && rdv.dateRdv !== null
        ? {
            day: this.dateRdv.getDate(),
            month: this.dateRdv.getMonth() + 1,
            year: this.dateRdv.getFullYear(),
          }
        : {
            day: today.getDate(),
            month: today.getMonth() + 1,
            year: today.getFullYear(),
          };

    this.heureRdv =
      rdv && rdv.dateRdv
        ? { hour: this.dateRdv.getHours(), minute: this.dateRdv.getMinutes() }
        : { hour: 10, minute: 20 };

    this.userId = (rdv && rdv.userId) || null;
    this.userName = (rdv && rdv.userName) || null;

    this.isNow = true;
    if (this.dateRdv !== today) {
      this.isNow = this.dateRdv <= today;
    }
  }
}
