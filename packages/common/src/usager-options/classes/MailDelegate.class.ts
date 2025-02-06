import { createDate } from "../../_core";
import { IMailDelegate } from "../interfaces";

export class MailDelegate implements IMailDelegate {
  public nom: string;
  public dateDebut: Date | null;
  public dateFin: Date | null;

  constructor(options?: Partial<IMailDelegate>) {
    this.nom = options?.nom || "";
    this.dateDebut = createDate(options?.dateDebut);
    this.dateFin = createDate(options?.dateFin);
  }
}
