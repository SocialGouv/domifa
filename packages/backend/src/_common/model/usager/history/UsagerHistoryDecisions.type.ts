import { AppEntity } from "../../_core/AppEntity.type";
import { UsagerDecisionMotif } from "../UsagerDecisionMotif.type";
import { UsagerDecisionOrientation } from "../UsagerDecisionOrientation.type";
import { UsagerDecisionStatut } from "../UsagerDecisionStatut.type";
import { UsagerTypeDom } from "../UsagerTypeDom.type";

export type UsagerHistoryDecisions = AppEntity & {
  usagerUUID: string; // unique
  usagerRef: number; // unique par structure
  structureId: number;

  dateDecision: Date; // Now()

  dateDebut: Date | null;
  dateFin: Date | null;

  typeDom: UsagerTypeDom | null;
  statut: UsagerDecisionStatut;

  // Motif de refus ou radiation
  motif: UsagerDecisionMotif | null;
  motifDetails: string | null;

  // Orientation si refus
  orientation: UsagerDecisionOrientation | null;
  orientationDetails: string | null;

  userId: number; // UserStructure.id
  userName: string; // UserStructure.nom / prenom
};
