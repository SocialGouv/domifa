import { StructureDecisionStatut } from "../types";

export const STRUCTURE_DECISION_LABELS: {
  [key in StructureDecisionStatut]: string;
} = {
  VALIDE: "Validée",
  REFUS: "Refusée",
  SUPPRIME: "Supprimée",
  EN_ATTENTE: "En attente",
};
