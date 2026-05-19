import { LogAction } from "../../app-logs/types";

export type SecurityLogAction = Extract<
  LogAction,
  "BLOCK_USER" | "REQUEST_BLOCKED" | "THROTTLE_BLOCKED"
>;

export interface BlockedUserSummary {
  userId: number;
  userProfile?: string;
  structureId?: number;
  structureName?: string;
  structureCity?: string;
  email?: string;
  role?: string;
  reason?: string;
  // Trigger details extracted from the BLOCK_USER log context. Present when the
  // block was caused by a throttle/request event (e.g. throttle_targeted) so the
  // alert email can surface the IP/URL/identifier without an admin opening app_log.
  triggerIp?: string;
  triggerUrl?: string;
  triggerMethod?: string;
  attemptedIdentifier?: string;
  targetRoute?: string;
  throttle?: {
    windowLabel: string;
    limit: number;
  };
}

export interface BlockedIpSummary {
  ip: string;
  attempts: number;
  reasons: string[];
  lastUrl?: string;
  // Populated when at least one THROTTLE_BLOCKED log was aggregated for this IP.
  // Kept as the worst hit observed (largest totalHits) so the email surfaces the most demanding tier.
  throttle?: {
    windowLabel: string;
    limit: number;
    totalHits: number;
  };
  // Distinct email/login identifiers attempted from this IP on login endpoints.
  // Capped to keep the email compact; overflowCount tracks the surplus.
  attemptedIdentifiers?: string[];
  attemptedIdentifiersOverflow?: number;
}

export interface SuspiciousActivitySummary {
  windowStart: Date;
  windowEnd: Date;
  totals: Record<SecurityLogAction, number>;
  blockedUsers: BlockedUserSummary[];
  blockedIps: BlockedIpSummary[];
}
