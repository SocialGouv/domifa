import { UsagerVisibleHistoryDecisionStatut } from "./history/UsagerVisibleHistoryDecisionStatut.type";

export const USAGER_DECISION_STATUT_COLORS: {
  [key in UsagerVisibleHistoryDecisionStatut]: string;
} = {
  PREMIERE: "green-status",
  PREMIERE_DOM: "green-status",
  VALIDE: "green-status",
  INSTRUCTION: "grey-status",
  ATTENTE_DECISION: "orange-status",
  REFUS: "red-status",
  RADIE: "red-status",
  IMPORT: "grey-status",
};
