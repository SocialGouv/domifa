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
  public dateDebut: Date | null;
  public dateFin: Date | null;
  public dateDecision: Date; // Now()

  public typeDom: UsagerTypeDom;
  public statut: UsagerDecisionStatut;
  public statutLabel: string;
  // Motif de refus ou radiation
  public motif: UsagerDecisionMotif | null;
  public motifDetails: string;

  // Motif + détail
  public motifString: string;

  // Orientation si refus
  public orientation: UsagerDecisionOrientation | null;
  public orientationDetails: string | null;

  public userId: number | null; // UserStructure.id
  public userName: string; // UserStructure.nom / prenom

  constructor(decision?: UsagerDecision) {
    this.uuid = decision?.uuid;
    this.dateDebut = decision?.dateDebut ? new Date(decision.dateDebut) : null;
    this.dateFin = decision?.dateFin ? new Date(decision.dateFin) : null;
    this.dateDecision = decision?.dateDecision
      ? new Date(decision.dateDecision)
      : new Date();
    this.typeDom = decision?.typeDom || "PREMIERE_DOM";
    this.statut = decision?.statut || "INSTRUCTION";
    this.statutLabel = USAGER_DECISION_STATUT_LABELS_PROFIL[this.statut];
    this.motif = decision?.motif || null;
    this.motifDetails = decision?.motifDetails || "";
    this.motifString = decision?.statut ? generateMotifLabel(decision) : "";
    this.orientation = decision?.orientation || null;
    this.orientationDetails = decision?.orientationDetails || "";
    this.userId = decision?.userId || null;
    this.userName = decision?.userName || "";
  }
}
