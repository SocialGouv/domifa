import {
  UsagerDecision,
  UsagerTypeDom,
  UsagerDecisionStatut,
  UsagerDecisionMotif,
  UsagerDecisionOrientation,
  USAGER_DECISION_STATUT_LABELS_PROFIL,
} from "../../../../_common/model";
import { generateMotifLabel } from "../utils";

export class Decision implements UsagerDecision {
  public uuid?: string;
  public dateDebut: Date;
  public dateFin?: Date;
  public dateDecision: Date; // Now()

  public typeDom: UsagerTypeDom;
  public statut: UsagerDecisionStatut;
  public statutLabel: string;
  // Motif de refus ou radiation
  public motif: UsagerDecisionMotif | null;
  public motifDetails?: string;

  // Motif + détail
  public motifString: string;

  // Orientation si refus
  public orientation: UsagerDecisionOrientation | null;
  public orientationDetails: string | null;

  public userId: number | null; // UserStructure.id
  public userName: string; // UserStructure.nom / prenom

  constructor(decision?: UsagerDecision) {
    this.uuid = decision && decision?.uuid;
    this.typeDom = (decision && decision.typeDom) || "PREMIERE_DOM";
    this.dateDebut =
      decision && decision.dateDebut ? new Date(decision.dateDebut) : null;
    this.dateFin =
      decision && decision.dateFin ? new Date(decision.dateFin) : null;
    this.dateDecision =
      (decision && new Date(decision.dateDecision)) || new Date();

    this.userName = (decision && decision.userName) || "";
    this.userId = (decision && decision.userId) || null;
    this.motifDetails = (decision && decision.motifDetails) || "";
    this.motif = (decision && decision.motif) || null;
    this.statut = (decision && decision.statut) || "INSTRUCTION";
    this.motifString = "";

    this.orientation = (decision && decision.orientation) || null;
    this.orientationDetails = (decision && decision.orientationDetails) || "";

    this.statutLabel = USAGER_DECISION_STATUT_LABELS_PROFIL[this.statut];

    if (decision && decision.statut) {
      this.motifString = generateMotifLabel(decision);
    }
  }
}
