import { UsagerOptionsProcuration } from "../../../../_common/model";

export class UsagerProcuration implements UsagerOptionsProcuration {
  public nom: string | null;
  public prenom: string | null;
  public dateFin: Date | null;
  public dateDebut: Date | null;
  public dateNaissance: Date | null;

  constructor(procuration?: Partial<UsagerOptionsProcuration>) {
    this.nom = procuration?.nom || "";
    this.prenom = procuration?.prenom || "";
    this.dateNaissance = procuration?.dateNaissance
      ? new Date(procuration.dateNaissance)
      : null;
    this.dateFin = procuration?.dateFin ? new Date(procuration.dateFin) : null;
    this.dateDebut = procuration?.dateDebut
      ? new Date(procuration.dateDebut)
      : null;
  }
}
