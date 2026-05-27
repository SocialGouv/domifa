import {
  SecurityLogAction,
  UserStructureRole,
  UserSupervisorRole,
} from "@domifa/common";

import {
  appLogSecurityRepository,
  AppLogSecurityTable,
  userStructureRepository,
  userSupervisorRepository,
  userUsagerRepository,
} from "../../database";
import { appLogger } from "../../util";
import { UserProfile } from "../../_common/model";
import { userTypeFromProfile } from "./app-logs.helpers";
import { AppLogActorType } from "./types";

// Minimal request-bound context attached to every security log row. When the
// caller has the Express request handy, both fields should be populated so the
// row can be filtered by ip / user-agent without poking into `context`.
export type SecurityLogRequestContext = {
  ip?: string;
  userAgent?: string;
};

// Single shape the rest of the codebase uses to record an event in
// `app_log_security`. The subject of the event is either an identified user
// (one of the three profiles + optional structure/role) or an anonymous actor
// (typically a failed login on an unknown email — `identifier` is stashed in
// `context` so the audit trail still surfaces *who* was being targeted).
export type LogSecurityEventParams = {
  action: SecurityLogAction;
  profile?: UserProfile;
  userId?: number;
  userType?: AppLogActorType;
  structureId?: number;
  role?: UserStructureRole | UserSupervisorRole;
  requestContext?: SecurityLogRequestContext;
  identifier?: string;
  context?: Record<string, unknown>;
  // Display name of the subject snapshotted on the row. Resolved lazily from
  // the matching user_* table when not provided.
  userName?: string;
};

// Writes a single row to `app_log_security`. Best-effort: a failure here must
// never block the underlying flow (login, password change, etc.), so we
// swallow the error and log it for diagnostics.
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

    row.userName =
      params.userName ?? (await resolveUserName(userType, params.userId));

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
  // Keep the failed-login identifier (email/login) when the user could not be
  // resolved — it's the only audit handle left for that row.
  if (params.userType === "anonymous" && params.identifier) {
    return { identifier: params.identifier, ...extra };
  }
  return Object.keys(extra).length > 0 ? extra : undefined;
}

// Best-effort lookup so the `userName` column is populated without forcing
// every call site to pass it. Returns undefined when the user can't be
// resolved (system, anonymous, missing FK) so the column stays NULL.
async function resolveUserName(
  userType: AppLogActorType,
  userId: number | undefined
): Promise<string | undefined> {
  if (!userId) {
    return undefined;
  }
  if (userType === "user_structure") {
    const u = await userStructureRepository.findOne({
      where: { id: userId },
      select: { nom: true, prenom: true },
    });
    return u
      ? `${u.prenom ?? ""} ${u.nom ?? ""}`.trim() || undefined
      : undefined;
  }
  if (userType === "user_supervisor") {
    const u = await userSupervisorRepository.findOne({
      where: { id: userId },
      select: { nom: true, prenom: true },
    });
    return u
      ? `${u.prenom ?? ""} ${u.nom ?? ""}`.trim() || undefined
      : undefined;
  }
  if (userType === "usager") {
    const u = await userUsagerRepository.findOne({
      where: { id: userId },
      select: { login: true },
    });
    return u?.login ?? undefined;
  }
  return undefined;
}
