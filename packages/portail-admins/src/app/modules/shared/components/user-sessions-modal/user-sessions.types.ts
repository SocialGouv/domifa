// Local mirror of CurrentUserSession / HistoricalUserSession from the backend
// model. Inlined to avoid pulling backend-only types into the frontend chunk.

export interface SessionRecord {
  uuid: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  expiresAt: string;
  lastVerifiedAt: string | null;
  fingerprintHash: string;
}

export interface HistoricalSessionRecord extends SessionRecord {
  closedAt: string;
  closedReason: string;
}

export interface UserSessionsView {
  userId: number;
  currentSession: SessionRecord | null;
  sessionsHistory: HistoricalSessionRecord[];
  fingerprintHash: string | null;
}

export type SessionsUserProfile = "user_structure" | "user_supervisor";

// French labels for session-closure reasons (kept locally to avoid pulling
// suspicious-activity module into the shared chunk).
export const SESSION_CLOSED_REASON_LABELS: Record<string, string> = {
  EXPIRED: "Expirée",
  REPLACED: "Remplacée par une nouvelle session",
  IP_MISMATCH: "Adresse IP différente",
  UA_MISMATCH: "Navigateur différent",
  MANUAL_LOGOUT: "Déconnexion manuelle",
  ADMIN_REVOKED: "Révoquée par un administrateur",
  OTP_REQUIRED: "OTP requis (session abandonnée)",
};
