import { Request } from "express";

// Traefik (and most edge proxies) set X-Real-IP to the actual client IP.
// `req.ip` only works correctly if Express `trust proxy` matches the proxy
// chain length, which can be brittle on K8s + Traefik with multiple hops.
// Preferring X-Real-IP first sidesteps that and falls back to req.ip otherwise.
export function getClientIp(req: Request): string {
  const xRealIp = req.headers["x-real-ip"];
  if (typeof xRealIp === "string" && xRealIp.length > 0) {
    return xRealIp;
  }
  return req.ip ?? "";
}

export function getClientUserAgent(req: Request): string {
  return req.headers["user-agent"] ?? "";
}
