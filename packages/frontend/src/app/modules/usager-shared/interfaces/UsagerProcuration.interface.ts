import { UsagerOptionsProcuration } from "../../../../_common/model";

export class UsagerProcuration implements UsagerOptionsProcuration {
  public nom: string;
  public prenom: string;
  public dateFin: Date | null;
  public dateDebut: Date | null;
  public dateNaissance: Date | string | null;

  constructor(procuration?: Partial<UsagerOptionsProcuration>) {
    this.nom = (procuration && procuration.nom) || null;
    this.prenom = (procuration && procuration.prenom) || null;

    this.dateNaissance =
      procuration && procuration.dateNaissance
        ? new Date(procuration.dateNaissance)
        : null;

    this.dateFin =
      procuration && procuration.dateFin ? new Date(procuration.dateFin) : null;

    this.dateDebut =
      procuration && procuration.dateDebut
        ? new Date(procuration.dateDebut)
        : null;
  }
}
