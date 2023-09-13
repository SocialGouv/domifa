import { UsagerOptionsProcuration } from "@domifa/common";

export class UsagerProcuration implements UsagerOptionsProcuration {
  public nom: string;
  public prenom: string;
  public dateNaissance: Date;
  public dateFin: Date;
  public dateDebut: Date;

  constructor(procuration?: Partial<UsagerOptionsProcuration>) {
    this.nom = procuration?.nom || "";
    this.prenom = procuration?.prenom || "";
    this.dateNaissance = createDate(procuration?.dateNaissance);
    this.dateFin = createDate(procuration?.dateFin);
    this.dateDebut = createDate(procuration?.dateDebut);
  }
}

const createDate = (date?: Date | string): Date | null => {
  return date ? new Date(date) : null;
};
