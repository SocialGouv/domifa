export class Decision {
  public dateDebut: Date;
  public dateFin: Date;
  public dateDemande: Date;
  public dateInstruction: Date;
  public statut: string;
  public motif: string;
  public userId: number;

  public userDecisionId: number;
  public userDecisionName: string;
  public userInstructionId: number;
  public userInstructionName: string;

  public agent: string;
  public motifDetails: string;
  public orientation: number;
  public orientationDetails: string;

  constructor(decision?: any) {
    this.dateDebut = (decision && decision.dateDebut) || undefined;
    this.dateFin = (decision && decision.dateFin) || undefined;
    this.dateDemande = (decision && decision.dateDemande) || undefined;
    this.dateInstruction = (decision && decision.dateInstruction) || new Date();
    this.statut = (decision && decision.statut) || "instruction";
    this.motif = (decision && decision.motif) || "";
    this.userDecisionId = (decision && decision.userDecisionId) || "";
    this.userDecisionName = (decision && decision.userDecisionName) || "";
    this.userInstructionId = (decision && decision.userInstructionId) || "";
    this.userInstructionName = (decision && decision.userInstructionName) || "";
    this.userId = (decision && decision.userId) || "";
    this.agent = (decision && decision.agent) || "";
    this.motifDetails = (decision && decision.motifDetails) || "";
    this.orientation = (decision && decision.orientation) || "";
    this.orientationDetails = (decision && decision.orientationDetails) || "";
  }
}
