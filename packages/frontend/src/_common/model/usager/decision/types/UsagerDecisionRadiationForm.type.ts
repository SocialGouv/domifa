import { UsagerDecisionMotif, UsagerDecisionStatut } from "@domifa/common";

export interface UsagerDecisionRadiationForm {
  statut: UsagerDecisionStatut;
  motif: UsagerDecisionMotif;
  motifDetails?: string;
  dateFin: Date;
}
