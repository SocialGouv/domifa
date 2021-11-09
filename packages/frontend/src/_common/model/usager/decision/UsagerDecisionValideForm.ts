import { UsagerDecisionStatut } from ".";

export type UsagerDecisionValideForm = {
  dateDebut: Date;
  dateFin: Date;
  statut: UsagerDecisionStatut;
  customRef?: string;
};
