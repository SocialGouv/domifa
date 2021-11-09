import { UsagerDecisionStatut } from ".";
import { UsagerDecisionMotif } from "./UsagerDecisionMotif.type";
import { UsagerDecisionOrientation } from "./UsagerDecisionOrientation.type";

export type UsagerDecisionRefusForm = {
  dateDebut: Date;
  dateFin: Date;

  statut: UsagerDecisionStatut;
  motif: UsagerDecisionMotif;
  motifDetails?: string;
  orientation: UsagerDecisionOrientation;
  orientationDetails: string;
};
