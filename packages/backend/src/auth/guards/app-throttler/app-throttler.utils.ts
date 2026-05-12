import { isbot } from "isbot";
import { Request } from "express";
import { jwtDecode } from "jwt-decode";
import { domifaConfig } from "../../../config";
import { UserStructureJwtPayload } from "../../../_common/model/jwt/user-structure-jwt-payload.interface";
import { UserSupervisorJwtPayload } from "../../../_common/model/jwt/user-supervisor-jwt-payload.interface";
import { UserUsagerJwtPayload } from "../../../_common/model/jwt/user-usager-jwt-payload.interface";
import {
  RequestBlockReason,
  ThrottleBlockedJwtUser,
} from "./app-throttler.types";

const HEALTHZ_PREFIX = "/healthz";

export function isHealthzRoute(url: string): boolean {
  if (!url) return false;
  // Match "/healthz", "/healthz/", "/healthz?..." but not e.g. "/healthz-foo"
  if (url === HEALTHZ_PREFIX) return true;
  return (
    url.startsWith(`${HEALTHZ_PREFIX}/`) || url.startsWith(`${HEALTHZ_PREFIX}?`)
  );
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
  if (!referer || Array.isArray(referer)) return null;
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
  const userAgent = request.headers["user-agent"];
  if (!userAgent || userAgent.trim() === "") {
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

  const base: ThrottleBlockedJwtUser = {
    userId: payload._userId,
    userProfile: payload._userProfile,
  };

  if (payload._userProfile === "structure") {
    const p = payload as UserStructureJwtPayload;
    return {
      ...base,
      email: p.email,
      structureId: p.structureId,
      role: p.role,
    };
  }

  if (payload._userProfile === "usager") {
    const p = payload as UserUsagerJwtPayload;
    return { ...base, structureId: p.structureId };
  }

  return base;
}
