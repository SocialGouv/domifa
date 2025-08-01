export type LogAction =
  // Docs
  | "USAGERS_DOCS_UPLOAD"
  | "USAGERS_DOCS_DOWNLOAD"
  | "USAGERS_DOCS_DELETE"
  | "USAGERS_DOCS_RENAME"
  | "USAGERS_DOCS_SHARED"

  //
  | "USAGERS_PATCH_SMS_PHONE_NUMBER"
  | "USAGERS_PATCH_EMAIL"
  | "USAGERS_ENABLE_SMS"
  | "USAGERS_DISABLE_SMS"

  // Mon DomiFa
  | "MON_DOMIFA_DOWNLOAD_DOC"
  | "MON_DOMIFA_DOWNLOAD_DOC_TRY"
  ///
  | "EXPORT_USAGERS"
  | "GET_STATS"
  | "EXPORT_STATS"
  | "EXPORT_STATS_FROM_ADMIN"
  | "ENABLE_SMS_BY_STRUCTURE"
  | "DISABLE_SMS_BY_STRUCTURE"
  | "EXPORT_DOMIFA"
  | "GET_STATS_PORTAIL_ADMIN"
  | "EXPORT_STATS_PORTAIL_ADMIN"
  | "IMPORT_USAGERS_SUCCESS" // Import réussi
  | "IMPORT_USAGERS_FAILED" // Import échoué
  | "DOWNLOAD_IMPORT_TEMPLATE" // Téléchargement modèle Excel
  | "DOWNLOAD_IMPORT_GUIDE" // Téléchargement guide PDF
  // ADMIN
  | "VALIDATE_STRUCTURE" // @deprecated
  | "DELETE_STRUCTURE" // @deprecated
  | "ADMIN_VALIDATE_STRUCTURE"
  | "ADMIN_DELETE_STRUCTURE"
  | "ADMIN_CREATE_USER_STRUCTURE"
  | "ADMIN_CREATE_USER_SUPERVISOR"
  | "ADMIN_PATCH_USER_SUPERVISOR"
  | "ADMIN_DELETE_USER_SUPERVISOR"
  | "ADMIN_ELEVATE_ROLE_USER_SUPERVISOR"
  // deprecated
  | "SUPPRIMER_PIECE_JOINTE"
  | "SUPPRIMER_DOMICILIE"
  | "RESET_PASSWORD_PORTAIL"
  | "DOWNLOAD_PASSWORD_PORTAIL"
  | "DELETE_NOTE"
  | "ENABLE_PORTAIL_BY_STRUCTURE"
  | "DISABLE_PORTAIL_BY_STRUCTURE";
