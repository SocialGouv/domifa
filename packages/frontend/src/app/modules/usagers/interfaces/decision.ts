import {
  motifsRadiation,
  motifsRefus
} from "src/app/modules/usagers/usagers.labels";

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
    this.dateDebut = (decision && new Date(decision.dateDebut)) || undefined;
    this.dateFin = (decision && new Date(decision.dateFin)) || undefined;
    this.dateDecision =
      (decision && new Date(decision.dateDecision)) || new Date();
    this.statut = (decision && decision.statut) || "INSTRUCTION";

    this.motif = "";

    if (this.statut === "REFUS" || this.statut === "RADIE") {
      this.motif =
        this.statut === "REFUS"
          ? motifsRefus[decision.motif]
          : motifsRadiation[decision.motif];

      if (this.motif === "AUTRE") {
        this.motif = this.motifDetails;
      }
    }

    this.userName = (decision && decision.userName) || "";
    this.userId = (decision && decision.userId) || "";
    this.motifDetails = (decision && decision.motifDetails) || "";
    this.orientation = (decision && decision.orientation) || "";
    this.orientationDetails = (decision && decision.orientationDetails) || "";
  }
}
