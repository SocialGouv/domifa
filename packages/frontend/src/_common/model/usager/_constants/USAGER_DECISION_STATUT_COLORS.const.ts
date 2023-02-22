import { UsagerDecisionStatut } from "..";

export const USAGER_DECISION_STATUT_COLORS: {
  [key in UsagerDecisionStatut]: string;
} = {
  VALIDE: "label-actif",
  INSTRUCTION: "label-grey",
  ATTENTE_DECISION: "label-yellow",
  REFUS: "label-danger",
  RADIE: "label-danger",
};
