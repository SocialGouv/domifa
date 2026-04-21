import { type UsagerDecisionStatut } from "..";
export const USAGER_DECISION_STATUT_COLORS: {
  [key in UsagerDecisionStatut]: string;
} = {
  VALIDE: "fr-badge--success", // ✅ Vert
  INSTRUCTION: "fr-badge--info", // ℹ️ Bleu (pas de gris en DSFR)
  ATTENTE_DECISION: "fr-badge--warning", // ⚠️ Orange
  REFUS: "fr-badge--error", // ❌ Rouge
  RADIE: "fr-badge--error", // ❌ Rouge
};
