import { isbot } from "isbot";
import { Request } from "express";
import { verify as jwtVerify } from "jsonwebtoken";

import { domifaConfig } from "../../../config";
import { getClientUserAgent } from "../../../util/express/clientRequest.helper";
import { APP_THROTTLER_TIERS } from "./throttler.config";
import {
  ALLOWED_ASSISTIVE_BOT_PATTERNS,
  ALLOWED_FETCH_SITE_VALUES,
  BYPASS_PREFIXES,
  CAPTURED_HEADER_KEYS,
  INTERNAL_PROBE_EXACT_PATHS,
  INTERNAL_PROBE_PREFIXES,
  LOGIN_IDENTIFIER_ENDPOINTS,
  MAX_LOG_FIELD_LENGTH,
} from "./app-throttler.constants";
import {
  AttemptedTargetRoute,
  RequestBlockReason,
  ThrottleBlockedJwtUser,
} from "./app-throttler.types";

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

function sanitizeId(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
    return undefined;
  }
  return value;
}

export function formatThrottleWindow(ttlMs: number | undefined): string {
  if (typeof ttlMs !== "number" || !Number.isFinite(ttlMs)) {
    return "inconnue";
  }
  switch (ttlMs) {
    case 1_000:
      return "seconde";
    case 60_000:
      return "minute";
    case 3_600_000:
      return "heure";
    default: {
      const tier = APP_THROTTLER_TIERS.find((t) => t.ttl === ttlMs);
      return tier?.name ?? `${Math.round(ttlMs / 1000)}s`;
    }
  }
}

// Express routing is case-insensitive: lowercase the path but preserve the
// query string (tokens / identifiers are case-sensitive).
function normalizePathForMatching(url: string): string {
  if (!url) {
    return url;
  }
  const queryStart = url.indexOf("?");
  if (queryStart === -1) {
    return url.toLowerCase();
  }
  return url.slice(0, queryStart).toLowerCase() + url.slice(queryStart);
}

function matchesPrefix(url: string, prefix: string): boolean {
  const normalized = normalizePathForMatching(url);
  if (normalized === prefix) {
    return true;
  }
  return (
    normalized.startsWith(`${prefix}/`) || normalized.startsWith(`${prefix}?`)
  );
}

export function isBypassedRoute(url: string): boolean {
  if (!url) {
    return false;
  }
  return BYPASS_PREFIXES.some((prefix) => matchesPrefix(url, prefix));
}

export function isInternalProbeRoute(url: string): boolean {
  if (!url) {
    return false;
  }
  const queryStart = url.indexOf("?");
  const path = (
    queryStart === -1 ? url : url.slice(0, queryStart)
  ).toLowerCase();
  if (INTERNAL_PROBE_EXACT_PATHS.has(path)) {
    return true;
  }
  return INTERNAL_PROBE_PREFIXES.some((prefix) => matchesPrefix(url, prefix));
}

function findAttemptedTargetRoute(
  url: string
): AttemptedTargetRoute | undefined {
  const normalized = normalizePathForMatching(url);
  return LOGIN_IDENTIFIER_ENDPOINTS.find(
    (e) => normalized === e.prefix || normalized.startsWith(`${e.prefix}?`)
  );
}

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

export function extractVerifiedJwtUser(
  authHeader: string | undefined,
  jwtSecret: string
): ThrottleBlockedJwtUser | undefined {
  const token = authHeader?.split(" ")[1];
  if (!token) {
    return undefined;
  }

  let raw: unknown;
  try {
    raw = jwtVerify(token, jwtSecret);
  } catch {
    return undefined;
  }
  if (!raw || typeof raw !== "object") {
    return undefined;
  }
  const payload = raw as Record<string, unknown>;

  const userId = sanitizeId(payload._userId);
  const userProfile = sanitizeForLog(payload._userProfile);
  if (userId === undefined || userProfile === undefined) {
    return undefined;
  }

  const base: ThrottleBlockedJwtUser = { userId, userProfile };

  if (userProfile === "structure") {
    return {
      ...base,
      email: sanitizeForLog(payload.email),
      structureId: sanitizeId(payload.structureId),
      role: sanitizeForLog(payload.role),
    };
  }

  if (userProfile === "usager") {
    return { ...base, structureId: sanitizeId(payload.structureId) };
  }

  return base;
}

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function isAllowedAssistiveBot(userAgent: string): boolean {
  return ALLOWED_ASSISTIVE_BOT_PATTERNS.some((re) => re.test(userAgent));
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

export function getAllowedOrigins(): Set<string> {
  const apps = domifaConfig().apps;
  return new Set([
    stripTrailingSlash(apps.frontendUrl),
    stripTrailingSlash(apps.portailUsagersUrl),
    stripTrailingSlash(apps.portailAdminUrl),
  ]);
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

  // Sec-Fetch-Site is a browser-controlled forbidden header (non-forgeable
  // from attacker JS). Absent on non-browser clients and old browsers → we
  // only enforce when present.
  const fetchSite = request.headers["sec-fetch-site"];
  if (
    typeof fetchSite === "string" &&
    !ALLOWED_FETCH_SITE_VALUES.has(fetchSite)
  ) {
    return "invalid_fetch_site";
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
