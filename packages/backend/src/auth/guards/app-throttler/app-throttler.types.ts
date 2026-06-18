export interface ThrottleBlockedJwtUser {
  userId: number;
  userProfile: string;
  email?: string;
  structureId?: number;
  role?: string;
}

export type RequestBlockReason =
  | "missing_ua"
  | "bot_ua"
  | "invalid_origin"
  | "invalid_fetch_site";

export type AttemptedTargetRoute = {
  prefix: string;
  field: "email" | "login";
  userProfile: "structure" | "supervisor" | "usager";
};

export interface ThrottleBlockedLogContext {
  ip: string | undefined;
  userAgent: string | undefined;
  method: string;
  url: string;
  jwtUser?: ThrottleBlockedJwtUser;

  tracker?: string;
  key?: string;
  ttl?: number;
  limit?: number;
  totalHits?: number;

  reason?: RequestBlockReason;
  origin?: string;
  referer?: string;
  attempts?: number;

  attemptedIdentifier?: string;
  headers?: Record<string, string>;
}
