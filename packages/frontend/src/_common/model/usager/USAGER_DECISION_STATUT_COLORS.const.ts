import { UsagerDecisionStatut } from ".";

export const USAGER_DECISION_STATUT_COLORS: {
  [key in UsagerDecisionStatut]: string;
} = {
  VALIDE: "green-status",
  INSTRUCTION: "grey-status",
  ATTENTE_DECISION: "orange-status",
  REFUS: "red-status",
  RADIE: "red-status",
  IMPORT: "grey-status",
};
