import {
  UsagerDecisionStatut,
  UsagerDecisionMotif,
  UsagerDecisionOrientation,
} from "@domifa/common";

export type UsagerDecisionRefusForm = {
  dateDebut: Date;
  dateFin: Date;
  statut: UsagerDecisionStatut;
  motif: UsagerDecisionMotif;
  motifDetails?: string;
  orientation: UsagerDecisionOrientation;
  orientationDetails: string;
};
