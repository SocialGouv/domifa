// Flattened session record for the portail-admins structure detail "Sessions"
// tab. Aggregates the per-user `currentSession` + `sessionsHistory` JSON arrays
// across every user of a structure into a single timeline.
export interface StructureSessionRecord {
  // Session uuid as stored in user_structure_security.{currentSession,sessionsHistory}.
  uuid: string;
  ipAddress: string;
  userAgent: string;
  // ISO timestamps.
  createdAt: string;
  expiresAt: string;
  // Present only on closed sessions (sessionsHistory entries).
  closedAt?: string;
  closedReason?: string;
  status: "active" | "closed";
  // Owning user — denormalised on the backend so the frontend can render the
  // table without a separate user-lookup roundtrip.
  userId: number;
  userFullName: string;
  userEmail: string;
}
