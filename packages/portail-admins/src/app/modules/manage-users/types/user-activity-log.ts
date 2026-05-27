export interface UserActivityLog {
  id: number;
  action: string;
  role?: string;
  context?: Record<string, unknown> | null;
  createdAt: string | Date;
  // Only populated for `app_log_security` rows — promoted to first-class
  // columns there (see AppLogSecurityTable). Absent on regular `app_log`
  // rows, so the activity tab template guards on presence.
  ip?: string | null;
  userAgent?: string | null;
  // Subject's display name. Populated by structure-level aggregate endpoints
  // (logs across every user of the structure) and rendered in the optional
  // "Utilisateur" column. Single-user views leave this undefined.
  userName?: string | null;
}
