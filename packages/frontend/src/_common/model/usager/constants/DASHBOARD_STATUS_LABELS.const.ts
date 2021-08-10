import { UsagerDecisionStatut } from "..";
import { UsagerDecision } from "./../UsagerDecision.type";

/* DÉCISIONS */
export const DASHBOARD_STATUS_LABELS: {
  [key in UsagerDecisionStatut & "TOUS"]: string;
} = {
  TOUS: "Tous",
  ATTENTE_DECISION: "Attente de décision",
  INSTRUCTION: "À compléter",
  RADIE: "Radiés",
  REFUS: "Refusés",
  VALIDE: "Actifs",
};
