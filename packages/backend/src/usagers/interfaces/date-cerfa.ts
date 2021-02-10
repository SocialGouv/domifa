export class DateCerfa {
  public annee: string;
  public heure: string;
  public jour: string;
  public minutes: string;
  public mois: string;

  constructor(date?: Date | string) {
    this.annee = "";
    this.heure = "";
    this.jour = "";
    this.minutes = "";
    this.mois = "";

    if (date !== null && typeof date !== "undefined") {
      if (typeof date === "string") {
        date = new Date(date);
      }

      this.annee = date.getFullYear().toString();

      this.heure =
        date.getHours() < 10
          ? "0" + date.getHours().toString()
          : date.getHours().toString();

      this.minutes =
        date.getMinutes() < 10
          ? "0" + date.getMinutes().toString()
          : date.getMinutes().toString();

      this.jour =
        date.getDate() < 10
          ? "0" + date.getDate().toString()
          : date.getDate().toString();

      this.mois =
        date.getMonth() < 9
          ? "0" + (date.getMonth() + 1).toString()
          : (date.getMonth() + 1).toString();
    }
  }
}
