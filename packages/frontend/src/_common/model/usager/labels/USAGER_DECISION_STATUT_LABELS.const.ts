import { UsagerDecisionStatut } from "..";

export const USAGER_DECISION_STATUT_LABELS: {
  [key in UsagerDecisionStatut]?: string;
} = {
  VALIDE: "Actif",
  INSTRUCTION: "Instruction",
  ATTENTE_DECISION: "À valider",
  REFUS: "Refusé",
  RADIE: "Radié",
};
