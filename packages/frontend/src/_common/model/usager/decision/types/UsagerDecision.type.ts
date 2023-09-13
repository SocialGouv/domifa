import {
  UsagerTypeDom,
  UsagerDecisionMotif,
  UsagerDecisionOrientation,
  UsagerDecisionStatut,
} from "@domifa/common";

export type UsagerDecision = {
  uuid?: string; // permet d'identifier une décision en cas de suppression de l'historique

  dateDebut: Date | null;
  dateFin: Date | null;
  dateDecision: Date; // Now()

  typeDom: UsagerTypeDom;
  statut: UsagerDecisionStatut;

  // Motif de refus ou radiation
  motif: UsagerDecisionMotif | null;
  motifDetails: string | null;

  // Orientation si refus
  orientation: UsagerDecisionOrientation | null;
  orientationDetails: string | null;

  userId: number | null; // UserStructure.id
  userName: string; // UserStructure.nom / prenom
};
