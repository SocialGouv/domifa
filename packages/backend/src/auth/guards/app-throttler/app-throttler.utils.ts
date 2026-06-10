import { isbot } from "isbot";
import { Request } from "express";
import { jwtDecode } from "jwt-decode";
import { domifaConfig } from "../../../config";
import { UserStructureJwtPayload } from "../../../_common/model/jwt/user-structure-jwt-payload.interface";
import { UserSupervisorJwtPayload } from "../../../_common/model/jwt/user-supervisor-jwt-payload.interface";
import { UserUsagerJwtPayload } from "../../../_common/model/jwt/user-usager-jwt-payload.interface";
import { getClientUserAgent } from "../../../util/express/clientRequest.helper";
import {
  RequestBlockReason,
  ThrottleBlockedJwtUser,
} from "./app-throttler.types";

const MAX_LOG_FIELD_LENGTH = 512;

// Maps a throttler ttl (ms) to a human-readable window label.
// Matches the three tiers declared in app.module.ts: short (1s), medium (1min), long (1h).
export function formatThrottleWindow(ttlMs: number | undefined): string {
  if (typeof ttlMs !== "number" || !Number.isFinite(ttlMs)) return "inconnue";
  if (ttlMs <= 1_000) return "seconde";
  if (ttlMs <= 60_000) return "minute";
  return "heure";
}

// Login-like endpoints from which we want to capture the attempted identifier
// (email or usager login) when an IP is throttled or filtered. Surfaces a
// brute-force pattern targeting a specific account in the security alert.
// Includes password-reset request endpoints (account enumeration via reset).
// Passwords are NEVER read.
//
// The `userProfile` field also lets the throttler resolve the targeted
// account from an anonymous attempt — used to auto-block that account when
// the IP gets throttled (defense against IP rotation).
export type AttemptedTargetRoute = {
  prefix: string;
  field: "email" | "login";
  userProfile: "structure" | "supervisor" | "usager";
};

const LOGIN_IDENTIFIER_ENDPOINTS: ReadonlyArray<AttemptedTargetRoute> = [
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

function findAttemptedTargetRoute(
  url: string
): AttemptedTargetRoute | undefined {
  return LOGIN_IDENTIFIER_ENDPOINTS.find(
    (e) => url === e.prefix || url.startsWith(`${e.prefix}?`)
  );
}

export function extractLoginIdentifier(request: Request): string | undefined {
  const route = findAttemptedTargetRoute(request.url ?? "");
  if (!route) {
    return undefined;
  }
  const body = (request as { body?: unknown }).body;
  if (!body || typeof body !== "object") {
    return undefined;
  }
  const raw = (body as Record<string, unknown>)[route.field];
  return sanitizeForLog(raw);
}

export function extractAttemptedTarget(
  request: Request
): { route: AttemptedTargetRoute; identifier: string } | undefined {
  const route = findAttemptedTargetRoute(request.url ?? "");
  if (!route) {
    return undefined;
  }
  const body = (request as { body?: unknown }).body;
  if (!body || typeof body !== "object") {
    return undefined;
  }
  const raw = (body as Record<string, unknown>)[route.field];
  const identifier = sanitizeForLog(raw);
  if (!identifier) {
    return undefined;
  }
  return { route, identifier };
}

// Defense in depth — TypeORM already parameterizes queries, but request-
// controlled strings can still pollute logs (newlines, control chars, huge
// payloads). Cap length and strip ASCII control characters before storing.
export function sanitizeForLog(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }
  // eslint-disable-next-line no-control-regex
  const cleaned = value.replace(/[\x00-\x1F\x7F]/g, "");
  if (cleaned.length === 0) {
    return undefined;
  }
  return cleaned.length > MAX_LOG_FIELD_LENGTH
    ? cleaned.slice(0, MAX_LOG_FIELD_LENGTH)
    : cleaned;
}

// Headers preserved on REQUEST_BLOCKED / THROTTLE_BLOCKED log rows so an
// admin can tell a genuine bot from a UA-spoofed browser:
//  - host: target hostname (catches misrouted requests)
//  - accept / accept-language / accept-encoding: real browsers always send
//    these — a `Chrome` UA without them is suspicious
//  - sec-fetch-*, sec-ch-ua-*: client hints; modern browsers send them on
//    every navigation/fetch — absence is a strong spoof signal
//  - upgrade-insecure-requests, dnt: small but help characterise the client
//  - x-forwarded-for / x-real-ip / x-forwarded-proto: full proxy chain so we
//    can compare with the IP the throttler computed
// Authorization / Cookie / CSRF headers are intentionally excluded.
const CAPTURED_HEADER_KEYS: ReadonlyArray<readonly [string, string]> = [
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

export function extractRequestHeaders(
  request: Request
): Record<string, string> | undefined {
  const out: Record<string, string> = {};
  for (const [header, key] of CAPTURED_HEADER_KEYS) {
    const raw = request.headers[header];
    const joined = Array.isArray(raw) ? raw.join(", ") : raw;
    const cleaned = sanitizeForLog(joined);
    if (cleaned) {
      out[key] = cleaned;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

// Routes that bypass the whole throttler (bot filter + rate limit).
// - /healthz : k8s liveness/readiness probes
// - /stats/public-stats : cached public dashboard, no auth, no PII
const BYPASS_PREFIXES = ["/healthz", "/stats/public-stats"];

function matchesPrefix(url: string, prefix: string): boolean {
  if (url === prefix) {
    return true;
  }
  // Match "/prefix/...", "/prefix?..." but not e.g. "/prefix-foo"
  return url.startsWith(`${prefix}/`) || url.startsWith(`${prefix}?`);
}

export function isBypassedRoute(url: string): boolean {
  if (!url) {
    return false;
  }
  return BYPASS_PREFIXES.some((prefix) => matchesPrefix(url, prefix));
}

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function getAllowedOrigins(): Set<string> {
  const apps = domifaConfig().apps;
  return new Set([
    stripTrailingSlash(apps.frontendUrl),
    stripTrailingSlash(apps.portailUsagersUrl),
    stripTrailingSlash(apps.portailAdminUrl),
  ]);
}

function extractOriginFromReferer(
  referer: string | string[] | undefined
): string | null {
  if (!referer || Array.isArray(referer)) {
    return null;
  }
  try {
    const parsed = new URL(referer);
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return null;
  }
}

const ALLOWED_ASSISTIVE_BOT_PATTERNS = [/Google-Read-Aloud/i];

function isAllowedAssistiveBot(userAgent: string): boolean {
  return ALLOWED_ASSISTIVE_BOT_PATTERNS.some((re) => re.test(userAgent));
}

export function getBlockReason(
  request: Request,
  allowedOrigins: Set<string>
): RequestBlockReason | null {
  const userAgent = getClientUserAgent(request);
  if (userAgent.trim() === "") {
    return "missing_ua";
  }
  if (isbot(userAgent) && !isAllowedAssistiveBot(userAgent)) {
    return "bot_ua";
  }

  const origin = request.headers["origin"];
  const candidateOrigin =
    typeof origin === "string" && origin.length > 0
      ? origin
      : extractOriginFromReferer(request.headers["referer"]);

  if (
    !candidateOrigin ||
    !allowedOrigins.has(stripTrailingSlash(candidateOrigin))
  ) {
    return "invalid_origin";
  }

  return null;
}
type AnyJwtPayload =
  | UserStructureJwtPayload
  | UserUsagerJwtPayload
  | UserSupervisorJwtPayload;

function decodeJwtPayload(token: string): AnyJwtPayload | null {
  try {
    return jwtDecode<AnyJwtPayload>(token);
  } catch {
    return null;
  }
}

function sanitizeId(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return undefined;
  }
  return value;
}

export function extractJwtUser(
  authHeader: string | undefined
): ThrottleBlockedJwtUser | undefined {
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return undefined;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return undefined;
  }

  // Signature is not verified here (this runs before the auth guard), so all
  // string fields are attacker-controlled. Sanitize before they hit any log.
  const userId = sanitizeId(payload._userId);
  const userProfile = sanitizeForLog(payload._userProfile);
  if (userId === undefined || userProfile === undefined) {
    return undefined;
  }

  const base: ThrottleBlockedJwtUser = {
    userId,
    userProfile,
  };

  if (payload._userProfile === "structure") {
    const p = payload as UserStructureJwtPayload;
    return {
      ...base,
      email: sanitizeForLog(p.email),
      structureId: sanitizeId(p.structureId),
      role: sanitizeForLog(p.role),
    };
  }

  if (payload._userProfile === "usager") {
    const p = payload as UserUsagerJwtPayload;
    return { ...base, structureId: sanitizeId(p.structureId) };
  }

  return base;
}
