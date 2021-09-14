import { UsagerDecisionMotif } from "./UsagerDecisionMotif.type";
import { UsagerDecisionOrientation } from "./UsagerDecisionOrientation.type";
import { UsagerDecisionStatut } from "./UsagerDecisionStatut.type";
import { UsagerTypeDom } from "./UsagerTypeDom.type";

export type UsagerDecision = {
  uuid?: string; // permet d'identifier une décision en cas de suppression de l'historique

  dateDecision: Date; // Now()

  dateDebut?: Date;
  dateFin?: Date;

  typeDom?: UsagerTypeDom;
  statut: UsagerDecisionStatut;

  // Motif de refus ou radiation
  motif?: UsagerDecisionMotif;
  motifDetails?: string;

  // Orientation si refus
  orientation?: UsagerDecisionOrientation;
  orientationDetails?: string;

  userId: number; // UserStructure.id
  userName: string; // UserStructure.nom / prenom
};
