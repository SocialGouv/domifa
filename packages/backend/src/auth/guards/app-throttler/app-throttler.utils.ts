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
const LOGIN_IDENTIFIER_ENDPOINTS: ReadonlyArray<{
  prefix: string;
  field: "email" | "login";
}> = [
  { prefix: "/structures/auth/login", field: "email" },
  { prefix: "/portail-admins/auth/login", field: "email" },
  { prefix: "/portail-usagers/auth/login", field: "login" },
  { prefix: "/users/get-password-token", field: "email" },
  { prefix: "/users-supervisor/get-password-token", field: "email" },
];

export function extractLoginIdentifier(request: Request): string | undefined {
  const url = request.url ?? "";
  const endpoint = LOGIN_IDENTIFIER_ENDPOINTS.find(
    (e) => url === e.prefix || url.startsWith(`${e.prefix}?`)
  );
  if (!endpoint) return undefined;
  const body = (request as { body?: unknown }).body;
  if (!body || typeof body !== "object") return undefined;
  const raw = (body as Record<string, unknown>)[endpoint.field];
  return sanitizeForLog(raw);
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

export function getBlockReason(
  request: Request,
  allowedOrigins: Set<string>
): RequestBlockReason | null {
  const userAgent = getClientUserAgent(request);
  if (userAgent.trim() === "") {
    return "missing_ua";
  }
  if (isbot(userAgent)) {
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
