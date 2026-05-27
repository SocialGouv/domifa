import {
  SecurityLogAction,
  UserStructureRole,
  UserSupervisorRole,
} from "@domifa/common";

import { appLogSecurityRepository, AppLogSecurityTable } from "../../database";
import { appLogger } from "../../util";
import { UserProfile } from "../../_common/model";
import { userTypeFromProfile } from "./app-logs.helpers";
import { AppLogActorType } from "./types";

export type SecurityLogRequestContext = {
  ip?: string;
  userAgent?: string;
};

// PASSWORD_RESET and PASSWORD_CHANGED both invalidate the active session: a
// fresh credential must not coexist with the previous JWT fingerprint. Manual
// logout intentionally doesn't clear the DB session (so trust-token reconnect
// stays possible) — that's why it's absent from this union.
export type SessionTerminationReason = "PASSWORD_RESET" | "PASSWORD_CHANGED";

export type LogSecurityEventParams = {
  action: SecurityLogAction;
  profile?: UserProfile;
  userId?: number;
  userType?: AppLogActorType;
  structureId?: number;
  role?: UserStructureRole | UserSupervisorRole;
  requestContext?: SecurityLogRequestContext;
  // Identifier (email/login) attempted by the caller. Only persisted in
  // `context` when the user couldn't be resolved (userType=anonymous) — it's
  // the only audit handle left for those rows.
  identifier?: string;
  context?: Record<string, unknown>;
  userName?: string;
};

// Best-effort: a failure here must never block the underlying flow (login,
// password change, etc.).
export async function logSecurityEvent(
  params: LogSecurityEventParams
): Promise<void> {
  try {
    const userType: AppLogActorType =
      params.userType ??
      (params.profile ? userTypeFromProfile(params.profile) : "anonymous");

    const row: Partial<AppLogSecurityTable> = {
      userType,
      action: params.action,
      structureId: params.structureId,
      role: params.role,
      ip: params.requestContext?.ip,
      userAgent: params.requestContext?.userAgent,
      context: buildContext(params),
      userName: params.userName,
    };

    if (params.userId) {
      if (userType === "user_structure") {
        row.userStructureId = params.userId;
      } else if (userType === "user_supervisor") {
        row.userSupervisorId = params.userId;
      } else if (userType === "usager") {
        row.userUsagerId = params.userId;
      }
    }

    await appLogSecurityRepository.save(new AppLogSecurityTable(row));
  } catch (err) {
    appLogger.error("Failed to write app_log_security row", {
      sentry: true,
      action: params.action,
      err,
    });
  }
}

function buildContext(
  params: LogSecurityEventParams
): Record<string, unknown> | undefined {
  const extra = params.context ?? {};
  if (params.userType === "anonymous" && params.identifier) {
    return { identifier: params.identifier, ...extra };
  }
  return Object.keys(extra).length > 0 ? extra : undefined;
}

// Shape that any "user-like" object satisfies for log purposes — structures
// and supervisors have prenom/nom, usagers have a `login`.
type UserForLog = {
  id?: number;
  uuid?: string;
  prenom?: string | null;
  nom?: string | null;
  login?: string | null;
  structureId?: number;
  role?: UserStructureRole | UserSupervisorRole | string;
};

// Shorthand for the most common call shape: action + already-resolved user.
// Extracts userName / id / structureId / role / uuid from the user object so
// callers don't have to spread them by hand at every site.
export async function logSecurityEventForUser(
  action: SecurityLogAction,
  profile: UserProfile,
  user: UserForLog | null | undefined,
  options: {
    requestContext?: SecurityLogRequestContext;
    context?: Record<string, unknown>;
  } = {}
): Promise<void> {
  await logSecurityEvent({
    action,
    profile,
    userId: user?.id,
    structureId: user?.structureId,
    role: user?.role as UserStructureRole | UserSupervisorRole | undefined,
    requestContext: options.requestContext,
    context: options.context,
    userName: formatUserNameForLog(user),
  });
}

export function formatUserNameForLog(
  user:
    | { prenom?: string | null; nom?: string | null }
    | { login?: string | null }
    | null
    | undefined
): string | undefined {
  if (!user) {
    return undefined;
  }
  if ("login" in user && user.login) {
    return user.login;
  }
  if ("prenom" in user || "nom" in user) {
    const full = `${(user as { prenom?: string }).prenom ?? ""} ${
      (user as { nom?: string }).nom ?? ""
    }`.trim();
    return full.length > 0 ? full : undefined;
  }
  return undefined;
}
