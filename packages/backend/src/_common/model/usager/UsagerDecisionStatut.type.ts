export type UsagerDecisionStatut =
  | "VALIDE"
  | "INSTRUCTION"
  | "ATTENTE_DECISION"
  | "REFUS"
  | "RADIE"
  // FIX TEMPORAIRE : pour nettoyer l'historique
  | "PREMIERE"
  | "PREMIERE_DOM"
  | "IMPORT";
