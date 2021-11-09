import { UsagerDecisionStatut } from ".";
import { UsagerDecisionMotif } from "./UsagerDecisionMotif.type";

export type UsagerDecisionRadiationForm = {
  statut: UsagerDecisionStatut;
  motif: UsagerDecisionMotif;
  motifDetails?: string;
  dateFin: Date;
};
