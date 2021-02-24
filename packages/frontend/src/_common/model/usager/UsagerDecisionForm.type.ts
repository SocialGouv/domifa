import { UsagerDecisionStatut } from ".";
import { UsagerDecisionMotif } from "./UsagerDecisionMotif.type";
import { UsagerDecisionOrientation } from "./UsagerDecisionOrientation.type";

export type UsagerDecisionForm = {
  dateDebut?: Date;
  dateFin?: Date;
  dateDecision?: Date;
  statut: UsagerDecisionStatut;
  motif?: UsagerDecisionMotif;
  motifDetails?: string;
  orientation?: UsagerDecisionOrientation;
  orientationDetails?: string;
};
