import { Request } from "express";
import { IncomingHttpHeaders } from "node:http";
import validator from "validator";

const IP_MAX_LEN = 45;
const UA_MAX_LEN = 512;
const LOG_VALUE_MAX_LEN = 512;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x1F\x7F]/g;
const IPV6_MAPPED_PREFIX = "::ffff:";

export const SENTRY_HEADERS = [
  "host",
  "user-agent",
  "content-type",
  "content-length",
  "origin",
  "x-forwarded-for",
  "x-real-ip",
  "authorization",
] as const;

export const HTTP_LOG_HEADERS = [
  "host",
  "user-agent",
  "content-type",
  "content-length",
  "origin",
  "referer",
  "accept",
  "accept-language",
  "accept-encoding",
  "sec-fetch-site",
  "sec-fetch-mode",
  "sec-fetch-dest",
  "sec-fetch-user",
  "sec-ch-ua",
  "sec-ch-ua-mobile",
  "sec-ch-ua-platform",
  "upgrade-insecure-requests",
  "dnt",
  "x-forwarded-for",
  "x-real-ip",
  "x-forwarded-proto",
  "x-forwarded-host",
  "x-original-url",
  "x-rewrite-url",
  "x-http-method-override",
  "transfer-encoding",
  "authorization",
] as const;

export function sanitizeLogValue(raw: unknown): string | undefined {
  const value = Array.isArray(raw) ? raw.join(", ") : raw;
  if (typeof value !== "string") {
    return undefined;
  }
  const cleaned = value.replace(CONTROL_CHARS, "").trim();
  if (cleaned.length === 0) {
    return undefined;
  }
  return cleaned.slice(0, LOG_VALUE_MAX_LEN);
}

export function pickLoggableHeaders(
  headers: IncomingHttpHeaders | Record<string, string | undefined>,
  names: readonly string[]
): Record<string, string> {
  const picked: Record<string, string> = {};
  for (const name of names) {
    const value = sanitizeLogValue(headers[name]);
    if (!value) {
      continue;
    }
    picked[name] =
      name === "authorization" ? `${value.slice(0, 10)}-REDACTED` : value;
  }
  return picked;
}

export function getClientIp(req: Request): string {
  return normalizeIp(pickIpCandidate(req));
}

function pickIpCandidate(req: Request): string {
  const xRealIp = req.headers["x-real-ip"];
  if (typeof xRealIp === "string" && xRealIp.length > 0) {
    return xRealIp;
  }
  return req.ip ?? "";
}

function normalizeIp(raw: string): string {
  if (!raw || raw.length > IP_MAX_LEN * 2) {
    return "";
  }
  const cleaned = raw.replace(CONTROL_CHARS, "").trim();
  if (cleaned.length === 0 || cleaned.length > IP_MAX_LEN) {
    return "";
  }
  const unmapped = cleaned.startsWith(IPV6_MAPPED_PREFIX)
    ? cleaned.slice(IPV6_MAPPED_PREFIX.length)
    : cleaned;
  if (!validator.isIP(unmapped)) {
    return "";
  }
  return unmapped;
}

export function getClientUserAgent(req: Request): string {
  const raw = req.headers["user-agent"];
  if (typeof raw !== "string") {
    return "";
  }
  const cleaned = raw.replace(CONTROL_CHARS, "").trim();
  if (!validator.isLength(cleaned, { min: 1, max: UA_MAX_LEN })) {
    return "";
  }
  if (!validator.isAscii(cleaned)) {
    return "";
  }
  return cleaned;
}

// Strips minor version numbers from browser/engine tokens (e.g. `Chrome/120.0.6099.129`
// → `Chrome/120`, `AppleWebKit/605.1.15` → `AppleWebKit/605`). Kept apart from
// `getClientUserAgent` so audit logs still receive the raw UA — only session
// fingerprinting uses the normalized form, so auto-updating browsers (Edge in
// particular) don't look like device changes on every minor bump.
export function normalizeUserAgent(ua: string): string {
  if (!ua) {
    return ua;
  }
  return ua.replace(/(\/\d+)(?:\.\d+)+/g, "$1");
}

export function buildSecurityLogRequestContext(req: Request): {
  ip?: string;
  userAgent?: string;
} {
  const ip = getClientIp(req);
  const userAgent = getClientUserAgent(req);
  return {
    ip: ip.length > 0 ? ip : undefined,
    userAgent: userAgent.length > 0 ? userAgent : undefined,
  };
}
