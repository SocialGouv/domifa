import { Request } from "express";
import validator from "validator";

const IP_MAX_LEN = 45;
const UA_MAX_LEN = 512;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x1F\x7F]/g;
const IPV6_MAPPED_PREFIX = "::ffff:";

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
