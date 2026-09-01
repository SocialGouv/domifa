import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import {
  ActivateSupportSessionResponse,
  SupportSession,
  SupportSessionRevokedReason,
  UserStructureRole,
} from "@domifa/common";
import {
  myDataSource,
  structureRepository,
  supportSessionRepository,
  userStructureRepository,
} from "../../database";
import { SupportSessionTable } from "../../database/entities/support-session";
import { UserStructureTable } from "../../database/entities/user-structure";
import { acquireAdvisoryXactLock } from "../../database/services/_postgres";
import { UserAdminAuthenticated } from "../../_common/model";
import { SessionFingerprintService } from "../../auth/services/session-fingerprint.service";
import {
  logSecurityEvent,
  SecurityLogRequestContext,
} from "../app-logs/app-log-security-writer";

export const SUPPORT_MODE_ALLOWED_EMAIL_DOMAIN = "@fabrique.social.gouv.fr";
const SUPPORT_ATTACHMENT_DURATION_SECONDS = 60 * 60; // 1h

const CLOSED_REASON_BY_SUPPORT_REASON: Record<
  SupportSessionRevokedReason,
  "ADMIN_REVOKED" | "EXPIRED" | "REPLACED" | "MANUAL_LOGOUT"
> = {
  MANUAL_REVOKE: "ADMIN_REVOKED",
  EXPIRED: "EXPIRED",
  REPLACED: "REPLACED",
  STRUCTURE_LOGOUT: "MANUAL_LOGOUT",
};

// Attaches/detaches an admin's *own* structure account to a structure for a
// limited time — no dedicated shared account. Activating temporarily
// overwrites the activating supervisor's own user_structure row (matched by
// email) to role "support", saving its real role to restore on close; the
// account keeps authenticating through the normal email/password/OTP login
// flow (StructuresAuthController) with its own real credentials throughout.
// This service manages *which structure the account currently resolves to*
// (via the active row here) and *which role it currently carries* — see
// StructuresAuthService.findAuthUser for the read side, which only needs
// the structure resolution: role is read straight off the row as usual.
@Injectable()
export class SupportSessionService {
  constructor(
    private readonly sessionFingerprintService: SessionFingerprintService
  ) {}

  public async activate(
    supervisor: UserAdminAuthenticated,
    structureUuid: string,
    requestContext: SecurityLogRequestContext & {
      ip: string;
      userAgent: string;
    }
  ): Promise<ActivateSupportSessionResponse> {
    if (
      !supervisor.email
        ?.toLowerCase()
        .endsWith(SUPPORT_MODE_ALLOWED_EMAIL_DOMAIN)
    ) {
      throw new ForbiddenException("SUPPORT_MODE_NOT_ALLOWED");
    }

    const structure = await structureRepository.findOne({
      where: { uuid: structureUuid },
      select: { id: true, nom: true },
    });
    if (!structure) {
      throw new NotFoundException("STRUCTURE_NOT_FOUND");
    }

    const targetAccount = await this.resolveOwnAccount(supervisor);

    const startDate = new Date();
    const expiresAt = new Date(
      startDate.getTime() + SUPPORT_ATTACHMENT_DURATION_SECONDS * 1000
    );

    const { created, replacedPrior } = await myDataSource.transaction(
      async (manager) => {
        // Serializes concurrent "attach" clicks on this account — the
        // partial unique index alone can't prevent two requests from both
        // seeing "no active row" before either commits.
        await acquireAdvisoryXactLock(
          manager,
          `support-attach:${targetAccount.id}`
        );

        const sessionRepo = manager.getRepository(SupportSessionTable);
        const existingActive = await sessionRepo.findOne({
          where: { targetUserStructureId: targetAccount.id, status: "ACTIVE" },
        });
        if (existingActive) {
          await sessionRepo.update(
            { uuid: existingActive.uuid },
            {
              status: "REVOKED",
              revokedAt: new Date(),
              revokedBy: supervisor.email,
              revokedReason: "REPLACED",
            }
          );
        }

        // If an ACTIVE attachment already targeted this account (switching
        // structure without closing first), its live `role` column already
        // reads "support" — re-reading it here would save "support" as the
        // "original" role and permanently lose the real one. Carry the
        // previous row's originalRole forward instead; only take a fresh
        // snapshot (and only then flip the live role) when there was
        // nothing active to carry it from.
        let originalRole: UserStructureRole;
        if (existingActive) {
          originalRole = existingActive.originalRole ?? targetAccount.role;
        } else {
          originalRole = targetAccount.role;
          await manager
            .getRepository(UserStructureTable)
            .update({ id: targetAccount.id }, { role: "support" });
        }

        const createdRow = await sessionRepo.save(
          new SupportSessionTable({
            supervisorId: supervisor.id,
            supervisorEmail: supervisor.email,
            structureId: structure.id,
            targetUserStructureId: targetAccount.id,
            startDate,
            expiresAt,
            status: "ACTIVE",
            originalRole,
          })
        );

        return { created: createdRow, replacedPrior: !!existingActive };
      }
    );

    if (replacedPrior) {
      // Force a re-login against the newly attached structure rather than
      // silently keep using a token issued while attached elsewhere.
      await this.sessionFingerprintService.closeActiveSession(
        "structure",
        targetAccount.id,
        "REPLACED"
      );
    }

    await logSecurityEvent({
      action: "SUPPORT_SESSION_ACTIVATED",
      profile: "supervisor",
      userId: supervisor.id,
      structureId: structure.id,
      role: supervisor.role,
      requestContext,
      context: {
        supportSessionUuid: created.uuid,
        targetUserStructureId: targetAccount.id,
      },
    });

    return {
      expiresAt,
      structureId: structure.id,
      structureNom: structure.nom,
    };
  }

  public async revoke(
    supervisor: UserAdminAuthenticated,
    supportSessionUuid: string,
    requestContext: SecurityLogRequestContext = {}
  ): Promise<void> {
    const session = await supportSessionRepository.findOne({
      where: { uuid: supportSessionUuid },
    });
    if (!session) {
      throw new NotFoundException("SUPPORT_SESSION_NOT_FOUND");
    }
    if (session.status !== "ACTIVE") {
      return;
    }
    await this.closeSession(session, "MANUAL_REVOKE", supervisor.email, {
      ...requestContext,
      actorSupervisorId: supervisor.id,
    });
  }

  // Called from the structure logout endpoint (StructuresAuthController,
  // injected there like any other provider): if the support account itself
  // is logging out, end its current attachment too.
  public async revokeForStructureLogout(
    targetUserStructureId: number
  ): Promise<void> {
    const session = await supportSessionRepository.findOne({
      where: { targetUserStructureId, status: "ACTIVE" },
    });
    if (!session) {
      return;
    }
    await this.closeSession(session, "STRUCTURE_LOGOUT", "STRUCTURE_LOGOUT");
  }

  public async listForStructure(
    structureId: number
  ): Promise<SupportSession[]> {
    return supportSessionRepository.find({
      where: { structureId },
      order: { startDate: "DESC" },
      take: 50,
    });
  }

  // Cron entry point — closes every attachment past its expiresAt.
  public async expireDueSessions(): Promise<number> {
    const due = await supportSessionRepository.find({
      where: { status: "ACTIVE" },
    });
    const expired = due.filter((s) => s.expiresAt.getTime() <= Date.now());
    for (const session of expired) {
      await this.closeSession(session, "EXPIRED", "CRON");
    }
    return expired.length;
  }

  // Single choke point for ending an attachment, whatever the trigger
  // (manual revoke, cron expiry, replaced by a new activation, or the
  // support account logging out). `status` flipping off ACTIVE is what
  // actually cuts access: StructuresAuthService.findAuthUser refuses to
  // authenticate the support account once no ACTIVE row targets it — this
  // is independent of the session fingerprint below (disabled in test env),
  // so revocation is provable even there. Closing the fingerprint session
  // is a courtesy on top: it also forces an immediate re-login rather than
  // letting an already-issued token keep working until its next request
  // happens to notice the attachment is gone.
  //
  // Also restores the account's real role, saved in `originalRole` at
  // activation. This is the only place that restore happens — the
  // "REPLACED" eviction inside `activate()` deliberately does NOT go
  // through here (and must not restore the role): the admin is still in
  // support mode at that point, just re-targeting a different structure.
  private async closeSession(
    session: SupportSessionTable,
    reason: SupportSessionRevokedReason,
    revokedBy: string,
    logContext: Record<string, unknown> & SecurityLogRequestContext = {}
  ): Promise<void> {
    if (session.status !== "ACTIVE") {
      // Idempotency guard: every caller already filters to ACTIVE rows, but
      // this keeps the role-restore side effect below safe even if that
      // invariant is ever violated (e.g. a duplicate cron tick).
      return;
    }

    await this.sessionFingerprintService.closeActiveSession(
      "structure",
      session.targetUserStructureId,
      CLOSED_REASON_BY_SUPPORT_REASON[reason]
    );

    if (session.originalRole) {
      await userStructureRepository.update(
        { id: session.targetUserStructureId },
        { role: session.originalRole }
      );
    }

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

  // Resolves the activating supervisor's own structure account — the one
  // whose role will be temporarily toggled to "support". Matched by email,
  // not role: unlike the old single shared account, this account's stored
  // role is whatever the admin's real day-to-day role is (only ever
  // "support" transiently, while an attachment is active).
  private async resolveOwnAccount(supervisor: UserAdminAuthenticated) {
    const account = await userStructureRepository.findOne({
      where: { email: supervisor.email, status: "ACTIVE" },
    });
    if (!account) {
      throw new BadRequestException("SUPPORT_TARGET_ACCOUNT_NOT_FOUND");
    }
    return account;
  }
}
