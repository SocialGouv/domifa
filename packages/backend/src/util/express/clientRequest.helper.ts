import { Request } from "express";
import validator from "validator";

const IP_MAX_LEN = 45; // IPv6 textual form max length
const UA_MAX_LEN = 512; // real UAs rarely exceed ~250 chars
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x1F\x7F]/g;
const IPV6_MAPPED_PREFIX = "::ffff:";

// Traefik (the only ingress in our K8s setup) sets X-Real-IP to the actual
// client IP. We prefer it over Express's `req.ip` because the `trust proxy`
// chain length is brittle on K8s with multiple proxy hops.
//
// Hardened against header-borne attacks:
//  - rejects multi-valued (array) headers (smuggling ambiguity)
//  - strips ASCII control characters
//  - caps length to IPv6's textual max
//  - canonicalizes IPv4-mapped IPv6 ("::ffff:1.2.3.4" → "1.2.3.4")
//  - validates via validator.isIP (rejects base64 blobs, SQL fragments, anything
//    that isn't a real IP)
// Returns "" on failure rather than propagating attacker-controlled garbage
// into fingerprint hashes or logs.
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

// User-Agent is opaque text but we cap, clean, and shape-check it because:
// - It feeds the session/OTP fingerprint hash (stable input matters)
// - Control chars could poison non-JSON log sinks
// - Real UAs rarely exceed a few hundred characters; anything bigger is
//   either fuzzing or an attempt to bloat the DB row.
// - Real UAs are pure printable ASCII; non-ASCII is rejected to block
//   Unicode-based injection / homoglyph fingerprint evasion.
//
// Note: no upstream lib defines "UA shape" (the RFC grammar is free-form
// `*OCTET`). The custom check below is the minimum hygiene that proxies like
// nginx/Traefik also apply at parse time.
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

// Shortcut for log-writing callers: returns a SecurityLogRequestContext-shaped
// object that can be forwarded as-is. Empty strings (when the helpers reject
// the header value) are converted to undefined so the resulting columns stay
// null instead of "".
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
