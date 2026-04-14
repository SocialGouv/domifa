export type ThrottleBlockedJwtUser = {
  userId: number;
  userProfile: string;
  email?: string;
  structureId?: number;
  role?: string;
};

export type ThrottleBlockedLogContext = {
  ip: string | undefined;
  userAgent: string | undefined;
  method: string;
  url: string;
  throttlerName: string;
  limit: number;
  ttl: number;
  totalHits: number;
  jwtUser?: ThrottleBlockedJwtUser;
};
