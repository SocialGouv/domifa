import { UsagerDecisionStatut } from "@domifa/common";

export type UsagerDecisionValideForm = {
  dateDebut: Date;
  dateFin: Date;
  statut: UsagerDecisionStatut;
  customRef?: string;
};
