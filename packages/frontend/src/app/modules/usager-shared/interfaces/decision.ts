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
  public motif?: UsagerDecisionMotif;
  public motifDetails?: string;

  // Motif + détail
  public motifString?: string;

  // Orientation si refus
  public orientation?: UsagerDecisionOrientation;
  public orientationDetails?: string;

  public userId: number; // UserStructure.id
  public userName: string; // UserStructure.nom / prenom

  constructor(decision?: Partial<UsagerDecision>) {
    this.uuid = decision?.uuid;
    this.typeDom = decision?.typeDom;
    this.dateDebut = (decision && new Date(decision.dateDebut)) || undefined;
    this.dateFin = (decision && new Date(decision.dateFin)) || undefined;
    this.dateDecision =
      (decision && new Date(decision.dateDecision)) || new Date();
    this.statut = (decision && decision.statut) || "INSTRUCTION";

    this.userName = (decision && decision.userName) || "";
    this.userId = (decision && decision.userId) || null;
    this.motifDetails = (decision && decision.motifDetails) || "";
    this.motif = (decision && decision.motif) || null;
    this.motifString = "";

    this.orientation = (decision && decision.orientation) || null;
    this.orientationDetails = (decision && decision.orientationDetails) || "";

    this.statutLabel = USAGER_DECISION_STATUT_LABELS_PROFIL[this.statut];

    if (decision && decision.statut) {
      this.motifString = generateMotifLabel(decision);
    }
  }
}
