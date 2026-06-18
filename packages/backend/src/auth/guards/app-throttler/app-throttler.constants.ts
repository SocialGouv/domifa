import { AttemptedTargetRoute } from "./app-throttler.types";

export const MAX_LOG_FIELD_LENGTH = 512;

export const BYPASS_PREFIXES: ReadonlyArray<string> = [
  "/healthz",
  "/stats/public-stats",
];

export const LOGIN_IDENTIFIER_ENDPOINTS: ReadonlyArray<AttemptedTargetRoute> = [
  {
    prefix: "/structures/auth/login",
    field: "email",
    userProfile: "structure",
  },
  {
    prefix: "/portail-admins/auth/login",
    field: "email",
    userProfile: "supervisor",
  },
  {
    prefix: "/portail-usagers/auth/login",
    field: "login",
    userProfile: "usager",
  },
  {
    prefix: "/users/get-password-token",
    field: "email",
    userProfile: "structure",
  },
  {
    prefix: "/users-supervisor/get-password-token",
    field: "email",
    userProfile: "supervisor",
  },
];

// Authorization and Cookie are deliberately excluded (PII / secret).
export const CAPTURED_HEADER_KEYS: ReadonlyArray<readonly [string, string]> = [
  ["host", "host"],
  ["accept", "accept"],
  ["accept-language", "acceptLanguage"],
  ["accept-encoding", "acceptEncoding"],
  ["sec-fetch-site", "secFetchSite"],
  ["sec-fetch-mode", "secFetchMode"],
  ["sec-fetch-dest", "secFetchDest"],
  ["sec-fetch-user", "secFetchUser"],
  ["sec-ch-ua", "secChUa"],
  ["sec-ch-ua-mobile", "secChUaMobile"],
  ["sec-ch-ua-platform", "secChUaPlatform"],
  ["upgrade-insecure-requests", "upgradeInsecureRequests"],
  ["dnt", "dnt"],
  ["x-forwarded-for", "xForwardedFor"],
  ["x-real-ip", "xRealIp"],
  ["x-forwarded-proto", "xForwardedProto"],
];

export const ALLOWED_ASSISTIVE_BOT_PATTERNS: ReadonlyArray<RegExp> = [
  /Google-Read-Aloud/i,
];

export const ALLOWED_FETCH_SITE_VALUES: ReadonlySet<string> = new Set([
  "same-origin",
  "same-site",
  "none",
]);
