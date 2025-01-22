import {
  UsagerTypeDom,
  UsagerDecisionStatut,
  UsagerDecisionMotif,
  UsagerDecisionOrientation,
} from "../types";

export interface UsagerDecision {
  uuid: string; // permet d'identifier une décision en cas de suppression de l'historique

  dateDecision: Date; // Now()

  dateDebut: Date | null;
  dateFin: Date | null;

  typeDom?: UsagerTypeDom;
  statut: UsagerDecisionStatut;

  // Motif de refus ou radiation
  motif?: UsagerDecisionMotif | null;
  motifDetails?: string;

  // Orientation si refus
  orientation?: UsagerDecisionOrientation;
  orientationDetails?: string;

  userId: number; // UserStructure.id
  userName: string; // UserStructure.nom / prenom
}
