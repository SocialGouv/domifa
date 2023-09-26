import { type UsagerDecisionMotif } from "../types/UsagerDecisionMotif.type";
import { type UsagerDecisionOrientation } from "../types/UsagerDecisionOrientation.type";
import { type UsagerDecisionStatut } from "../types/UsagerDecisionStatut.type";
import { type UsagerTypeDom } from "../types/UsagerTypeDom.type";

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
