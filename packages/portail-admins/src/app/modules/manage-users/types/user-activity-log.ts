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
}
