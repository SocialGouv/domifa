import { UsagerOptionsProcuration } from "../../../../_common/model";

export class UsagerProcuration implements UsagerOptionsProcuration {
  public actif: boolean;
  public nom: string;
  public prenom: string;
  public dateFin: Date | null;
  public dateDebut: Date | null;
  public dateNaissance: Date | string | null;

  constructor(procuration?: Partial<UsagerOptionsProcuration>) {
    this.actif = (procuration && procuration.actif) || false;
    this.nom = (procuration && procuration.nom) || null;
    this.prenom = (procuration && procuration.prenom) || null;
    this.dateNaissance = null;
    this.dateFin = null;
    this.dateDebut = null;

    if (procuration) {
      if (procuration.dateNaissance) {
        this.dateNaissance = new Date(procuration.dateNaissance);
      }

      if (procuration.dateFin) {
        this.dateFin = new Date(procuration.dateFin);
      }

      if (procuration.dateDebut) {
        this.dateDebut = new Date(procuration.dateDebut);
      }
    }
  }
}
