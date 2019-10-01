export class Decision {
  public dateDebut: Date;
  public dateFin: Date;
  public dateDecision: Date;
  public statut: string;

  public userId: number;
  public userName: string;

  public motif: string;
  public motifDetails: string;
  public orientation: number;
  public orientationDetails: string;

  constructor(decision?: any) {
    this.dateDebut = (decision && decision.dateDebut) || undefined;
    this.dateFin = (decision && decision.dateFin) || undefined;
    this.dateDecision = (decision && decision.dateDecision) || new Date();
    this.statut = (decision && decision.statut) || "INSTRUCTION";
    this.motif = (decision && decision.motif) || "";
    this.userName = (decision && decision.userName) || "";
    this.userId = (decision && decision.userId) || "";
    this.motifDetails = (decision && decision.motifDetails) || "";
    this.orientation = (decision && decision.orientation) || "";
    this.orientationDetails = (decision && decision.orientationDetails) || "";
  }
}
