import { UsagerDecisionMotif } from "./UsagerDecisionMotif.type";
import { UsagerDecisionOrientation } from "./UsagerDecisionOrientation.type";
import { UsagerDecisionStatut } from "./UsagerDecisionStatut.type";
import { UsagerTypeDom } from "./UsagerTypeDom.type";

export type UsagerDecision = {
  dateDebut: Date;
  dateFin?: Date;
  dateDecision: Date; // Now()

  typeDom: UsagerTypeDom;
  statut: UsagerDecisionStatut;

  // Motif de refus ou radiation
  motif?: UsagerDecisionMotif;
  motifDetails?: string;

  // Orientation si refus
  orientation?: UsagerDecisionOrientation;
  orientationDetails?: string;

  userId: number; // AppUser.id
  userName: string; // AppUser.nom / prenom
};
