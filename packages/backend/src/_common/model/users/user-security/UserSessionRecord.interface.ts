// Closing reasons. Persisted on each historical session entry.
// REPLACED is emitted when a new login rotates the active session.
// OTP_REQUIRED is emitted when a login attempt without a valid trust token
// forces a fresh OTP cycle (current session is dropped so the old JWT and
// trust token cannot resurrect it).
// IP_MISMATCH / UA_MISMATCH / ADMIN_REVOKED are reserved for phase 3
// (post-2FA, blocking mode) and not produced by the current flow.
export type SessionClosedReason =
  | "EXPIRED"
  | "REPLACED"
  | "IP_MISMATCH"
  | "UA_MISMATCH"
  | "MANUAL_LOGOUT"
  | "ADMIN_REVOKED"
  | "OTP_REQUIRED";

// Active session for a user. Stored in the `currentSession` jsonb column
// of user_*_security; NULL on the row = no active session.
export interface CurrentUserSession {
  uuid: string;
  // Random per-session value (UUID v4). Mixed into the fingerprint hash so
  // that knowing (userUUID, ip, ua) is not enough to recompute it; it
  // matters once we move to blocking mode in phase 3. Never sent to the
  // client (not in the JWT, not in API responses).
  salt: string;
  fingerprintHash: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp
  lastVerifiedAt: string | null;
}

// Past session moved out of currentSession on logout/expiry/etc. Stored in
// the `sessionsHistory` jsonb array; purged by CRON after the retention
// window configured in SESSION_PURGE_AFTER_DAYS.
export interface HistoricalUserSession extends CurrentUserSession {
  closedAt: string;
  closedReason: SessionClosedReason;
}
