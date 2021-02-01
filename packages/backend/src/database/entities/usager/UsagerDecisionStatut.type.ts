export type UsagerDecisionStatut =
  | "VALIDE"
  | "INSTRUCTION"
  | "ATTENTE_DECISION"
  | "REFUS"
  | "RADIE"
  | "IMPORT"; // utilisé juste dans l'affichage de l'historique, pour tracer le fait que l'usager a été importé
