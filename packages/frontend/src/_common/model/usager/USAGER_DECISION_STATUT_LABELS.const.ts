import { UsagerVisibleHistoryDecisionStatut } from "./history/UsagerVisibleHistoryDecisionStatut.type";

export const USAGER_DECISION_STATUT_LABELS: {
  [key in UsagerVisibleHistoryDecisionStatut]: string;
} = {
  PREMIERE_DOM: "Première domiciliation",
  VALIDE: "Actif",
  INSTRUCTION: "Instruction",
  ATTENTE_DECISION: "À valider",
  REFUS: "Refusé",
  RADIE: "Radié",
  IMPORT: "Importé",
};
