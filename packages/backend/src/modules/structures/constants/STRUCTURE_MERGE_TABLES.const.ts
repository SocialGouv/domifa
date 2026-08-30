// Rows moved with each dossier (by usagerUUID); usagerRef is shifted too
export const STRUCTURE_MERGE_DOSSIER_TABLES_WITH_REF = [
  "usager_entretien",
  "usager_notes",
  "usager_docs",
  "interactions",
] as const;

export const STRUCTURE_MERGE_DOSSIER_TABLES = [
  "usager_history_states",
  "usager_options_history",
  "user_usager",
  "user_usager_login",
] as const;

// Moved in bulk once every dossier is done (usagerRef shifted where present)
export const STRUCTURE_MERGE_BULK_TABLES_WITH_REF = [
  "message_sms",
  "app_log",
] as const;

export const STRUCTURE_MERGE_BULK_TABLES = [
  "app_log_security",
  "expired_token",
] as const;

// Moved last: the agents of the source structure
export const STRUCTURE_MERGE_USER_TABLES = [
  "user_structure_security",
  "user_structure",
] as const;

// Every table counted before / after (same figures as the analysis)
export const STRUCTURE_MERGE_COUNTED_TABLES = [
  "usager",
  ...STRUCTURE_MERGE_DOSSIER_TABLES_WITH_REF,
  ...STRUCTURE_MERGE_DOSSIER_TABLES,
  "user_usager_security",
  ...STRUCTURE_MERGE_BULK_TABLES_WITH_REF,
  ...STRUCTURE_MERGE_BULK_TABLES,
  ...STRUCTURE_MERGE_USER_TABLES,
] as const;

// Deliberately left on the source (deleted with it): contact_support,
// structure_doc (+ S3), structure_information, structure_stats_reporting,
// open_data_places
