import { ThrottlerLimitDetail } from "@nestjs/throttler";

export interface ThrottleBlockedJwtUser {
  userId: number;
  userProfile: string;
  email?: string;
  structureId?: number;
  role?: string;
}

export interface ThrottleBlockedLogContext extends ThrottlerLimitDetail {
  ip: string | undefined;
  userAgent: string | undefined;
  method: string;
  url: string;
  jwtUser?: ThrottleBlockedJwtUser;
}
