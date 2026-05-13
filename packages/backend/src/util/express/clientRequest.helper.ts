import { Request } from "express";
import { isIP } from "node:net";

const IP_MAX_LEN = 45; // IPv6 textual form max length
const UA_MAX_LEN = 512; // real UAs rarely exceed ~250 chars
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x1F\x7F]/g;
// Printable ASCII only — what every real-world browser UA is made of. Rejects
// non-ASCII Unicode (homoglyph tricks, multi-byte injection, base64-of-binary
// payloads that slipped past the control-char filter).
// eslint-disable-next-line no-control-regex
const PRINTABLE_ASCII = /^[\x20-\x7E]*$/;
const IPV6_MAPPED_PREFIX = "::ffff:";

// Traefik (and most edge proxies) set X-Real-IP to the actual client IP.
// `req.ip` only works correctly if Express `trust proxy` matches the proxy
// chain length, which can be brittle on K8s + Traefik with multiple hops.
// Preferring X-Real-IP first sidesteps that and falls back to req.ip otherwise.
//
// Hardened against header-borne attacks: rejects multi-valued headers, strips
// control characters, caps length, and validates the result as a real IP via
// node:net (rejects base64 blobs, SQL fragments, anything that isn't an IP).
// Returns "" on failure rather than propagating attacker-controlled garbage
// into fingerprint hashes or logs.
export function getClientIp(req: Request): string {
  return normalizeIp(pickIpCandidate(req));
}

function pickIpCandidate(req: Request): string {
  const xRealIp = req.headers["x-real-ip"];
  // A multi-value (array) header is suspicious — refuse rather than pick one
  // arbitrarily, which would be a smuggling-style ambiguity. Only accept a
  // single string.
  if (typeof xRealIp === "string" && xRealIp.length > 0) {
    return xRealIp;
  }
  return req.ip ?? "";
}

function normalizeIp(raw: string): string {
  // Bound input length before any further processing to avoid unbounded work.
  if (!raw || raw.length > IP_MAX_LEN * 2) return "";
  const cleaned = raw.replace(CONTROL_CHARS, "").trim();
  if (cleaned.length === 0 || cleaned.length > IP_MAX_LEN) return "";
  // Canonicalize IPv4-mapped IPv6 ("::ffff:1.2.3.4") to plain IPv4 so the
  // fingerprint stays stable across networks that report either form.
  const unmapped = cleaned.startsWith(IPV6_MAPPED_PREFIX)
    ? cleaned.slice(IPV6_MAPPED_PREFIX.length)
    : cleaned;
  return isIP(unmapped) === 0 ? "" : unmapped;
}

// User-Agent is opaque text but we cap, clean, and shape-check it because:
// - It feeds the session/OTP fingerprint hash (stable input matters)
// - Control chars could poison non-JSON log sinks
// - Real UAs rarely exceed a few hundred characters; anything bigger is
//   either fuzzing or an attempt to bloat the DB row.
// - Real UAs are pure printable ASCII; non-ASCII content is rejected to
//   block Unicode-based injection / homoglyph fingerprint evasion.
export function getClientUserAgent(req: Request): string {
  const raw = req.headers["user-agent"];
  if (typeof raw !== "string") return "";
  const cleaned = raw.replace(CONTROL_CHARS, "").trim();
  if (cleaned.length === 0 || cleaned.length > UA_MAX_LEN) return "";
  if (!PRINTABLE_ASCII.test(cleaned)) return "";
  return cleaned;
}
