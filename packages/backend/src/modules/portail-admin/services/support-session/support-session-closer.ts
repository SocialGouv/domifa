import { SupportSessionRevokedReason } from "@domifa/common";
import {
  supportSessionRepository,
  userStructureRepository,
  userSupervisorRepository,
} from "../../../../database";
import { SupportSessionTable } from "../../../../database/entities/support-session";
import { SessionFingerprintService } from "../../../../auth/services/session-fingerprint.service";
import {
  logSecurityEvent,
  SecurityLogRequestContext,
} from "../../../app-logs/app-log-security-writer";

// SessionFingerprintService has no constructor dependencies of its own, so
// it's safe to instantiate directly here rather than go through Nest DI —
// this module is imported as a plain function both by SupportSessionService
// (portail-admin module) and by the structure logout endpoint (auth
// module), and pulling either module in to satisfy DI would create a
// circular module dependency.
const sessionFingerprintService = new SessionFingerprintService();

export const CLOSED_REASON_BY_SUPPORT_REASON: Record<
  SupportSessionRevokedReason,
  "ADMIN_REVOKED" | "EXPIRED" | "REPLACED" | "MANUAL_LOGOUT"
> = {
  MANUAL_REVOKE: "ADMIN_REVOKED",
  EXPIRED: "EXPIRED",
  REPLACED: "REPLACED",
  STRUCTURE_LOGOUT: "MANUAL_LOGOUT",
};

// Single choke point for ending a support session, whatever the trigger
// (manual revoke, cron expiry, replaced by a new activation, or the
// impersonated structure account logging out). Closes the underlying
// structure session (so the JWT's fingerprint check fails on the very next
// request), clears the DB flags, and writes the audit log entry.
export async function closeSupportSession(
  session: SupportSessionTable,
  reason: SupportSessionRevokedReason,
  revokedBy: string,
  logContext: Record<string, unknown> & SecurityLogRequestContext = {}
): Promise<void> {
  await sessionFingerprintService.closeActiveSession(
    "structure",
    session.targetUserStructureId,
    CLOSED_REASON_BY_SUPPORT_REASON[reason]
  );
  await userStructureRepository.update(
    { id: session.targetUserStructureId },
    { isSupportMode: false }
  );
  await userSupervisorRepository.update(
    { id: session.supervisorId },
    { support: null }
  );
  await supportSessionRepository.update(
    { uuid: session.uuid },
    {
      status: reason === "EXPIRED" ? "EXPIRED" : "REVOKED",
      revokedAt: new Date(),
      revokedBy,
      revokedReason: reason,
    }
  );

  const action =
    reason === "EXPIRED"
      ? "SUPPORT_SESSION_EXPIRED"
      : "SUPPORT_SESSION_REVOKED";
  const { ip, userAgent, ...context } = logContext;
  await logSecurityEvent({
    action,
    userType: "user_supervisor",
    userId: session.supervisorId,
    structureId: session.structureId,
    requestContext: { ip, userAgent },
    context: {
      supportSessionUuid: session.uuid,
      targetUserStructureId: session.targetUserStructureId,
      reason,
      ...context,
    },
  });
}

// Called from the structure logout endpoint (auth module): if the account
// logging out is under an active support session, end it too.
export async function revokeSupportSessionOnStructureLogout(
  targetUserStructureId: number
): Promise<void> {
  const session = await supportSessionRepository.findOne({
    where: { targetUserStructureId, status: "ACTIVE" },
  });
  if (!session) {
    return;
  }
  await closeSupportSession(session, "STRUCTURE_LOGOUT", "STRUCTURE_LOGOUT");
}
