import { LogAction } from "../../app-logs/types";

export type SecurityLogAction = Extract<
  LogAction,
  "BLOCK_USER" | "REQUEST_BLOCKED" | "THROTTLE_BLOCKED"
>;

export interface BlockedUserSummary {
  userId: number;
  userProfile?: string;
  structureId?: number;
  email?: string;
  role?: string;
  reason?: string;
}

export interface BlockedIpSummary {
  ip: string;
  attempts: number;
  reasons: string[];
  lastUrl?: string;
}

export interface SuspiciousActivitySummary {
  windowStart: Date;
  windowEnd: Date;
  totals: Record<SecurityLogAction, number>;
  blockedUsers: BlockedUserSummary[];
  blockedIps: BlockedIpSummary[];
}
