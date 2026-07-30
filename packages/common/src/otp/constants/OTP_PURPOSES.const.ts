export const OTP_PURPOSES = [
  "LOGIN",
  "EXPORT_STRUCTURE_USAGERS",
  "EXPORT_PORTAIL_USAGERS_ACCOUNTS",
  "EXPORT_ADMIN_STATS_DEPLOIEMENT",
  "RESET_USAGERS",
  "DOWNLOAD_MULTIPLE_DOCS",
  "DELETE_STRUCTURE",
  "UNBLOCK_USER",
  "BLOCK_USER_BY_ADMIN",
  "DELETE_USER_BY_ADMIN",
  "UNBLOCK_BREVO_CONTACT",
  // Legacy: replaced by EXPORT_* variants above. Kept in the union so past
  // rows/callers keep type-checking; do not use for new features.
  "EXPORT",
] as const;
