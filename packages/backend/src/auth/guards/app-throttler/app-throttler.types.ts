export interface ThrottleBlockedJwtUser {
  userId: number;
  userProfile: string;
  email?: string;
  structureId?: number;
  role?: string;
}

export type RequestBlockReason = "missing_ua" | "bot_ua" | "invalid_origin";

export interface ThrottleBlockedLogContext {
  // Request-level fields (always populated)
  ip: string | undefined;
  userAgent: string | undefined;
  method: string;
  url: string;
  jwtUser?: ThrottleBlockedJwtUser;

  // Throttle fields (populated only on THROTTLE_BLOCKED)
  tracker?: string;
  key?: string;
  ttl?: number;
  limit?: number;
  totalHits?: number;

  // Request-block fields (populated only on REQUEST_BLOCKED)
  reason?: RequestBlockReason;
  origin?: string;
  referer?: string;
  // Number of dedup'd attempts aggregated under a single log row.
  // Summed across rows over the auto-block window to decide on locking the account.
  attempts?: number;

  // Captured only when the blocked request targets a login endpoint. Surfaces
  // brute-force patterns aimed at a specific account in the security alert.
  attemptedIdentifier?: string;

  // Curated subset of request headers preserved for forensic inspection
  // (UA spoofing, proxy chain, sec-fetch metadata). See extractRequestHeaders.
  headers?: Record<string, string>;
}
