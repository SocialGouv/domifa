import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { LessThanOrEqual } from "typeorm";
import {
  ActivateSupportSessionResponse,
  getPasswordChangeStatus,
  SupportSession,
  SupportSessionRevokedReason,
  UserStructure,
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
const SUPPORT_ATTACHMENT_DURATION_MS = 60 * 60 * 1000; // 1h

const CLOSED_REASON_BY_SUPPORT_REASON: Record<
  SupportSessionRevokedReason,
  "ADMIN_REVOKED" | "EXPIRED" | "REPLACED" | "MANUAL_LOGOUT"
> = {
  MANUAL_REVOKE: "ADMIN_REVOKED",
  EXPIRED: "EXPIRED",
  REPLACED: "REPLACED",
  STRUCTURE_LOGOUT: "MANUAL_LOGOUT",
};

// Support mode attaches a super-admin's *own* structure account (matched by
// email) to another structure for a limited time:
// - on activation, the account's role is switched to "support" and its real
//   role saved in `originalRole`;
// - while ACTIVE, StructuresAuthService.findAuthUser resolves the account to
//   the attached structure;
// - on close (revoke, expiry, logout), the real role is restored.
// The account keeps logging in through the normal email/password/OTP flow.
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
    this.assertSupervisorAllowed(supervisor);

    const structure = await structureRepository.findOne({
      where: { uuid: structureUuid },
      select: { id: true, nom: true },
    });
    if (!structure) {
      throw new NotFoundException("STRUCTURE_NOT_FOUND");
    }

    const account = await this.findOwnAccount(supervisor);

    const startDate = new Date();
    const expiresAt = new Date(
      startDate.getTime() + SUPPORT_ATTACHMENT_DURATION_MS
    );

    this.assertPasswordValidDuringAttachment(account, expiresAt);

    const { session, replacedSession } = await this.attach({
      supervisor,
      structureId: structure.id,
      account,
      startDate,
      expiresAt,
    });

    if (replacedSession) {
      // Force a re-login against the newly attached structure rather than
      // keep using a token issued while attached elsewhere.
      await this.sessionFingerprintService.closeActiveSession(
        "structure",
        account.id,
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
        supportSessionUuid: session.uuid,
        targetUserStructureId: account.id,
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

  // The support account logging out of the structure app ends its attachment.
  public async revokeForStructureLogout(
    targetUserStructureId: number
  ): Promise<void> {
    const session = await this.findActiveForAccount(targetUserStructureId);
    if (!session) {
      return;
    }
    await this.closeSession(session, "STRUCTURE_LOGOUT", "STRUCTURE_LOGOUT");
  }

  private async findActiveForAccount(
    targetUserStructureId: number
  ): Promise<SupportSessionTable | null> {
    return supportSessionRepository.findOne({
      where: { targetUserStructureId, status: "ACTIVE" },
    });
  }

  // Called on structure login: an attachment past its expiresAt but not yet
  // swept by the cron leaves the account stuck on role "support" while
  // findAuthUser already refuses it. Closing it here gives the admin their
  // own account back right away. Returns the user with its current role.
  public async closeExpiredSupportSession(
    user: UserStructure
  ): Promise<UserStructure> {
    const session = await supportSessionRepository.findOne({
      where: {
        targetUserStructureId: user.id,
        status: "ACTIVE",
        expiresAt: LessThanOrEqual(new Date()),
      },
    });
    if (!session) {
      return user;
    }

    await this.expire(session, "LOGIN");

    const { role } = await userStructureRepository.findOneOrFail({
      where: { id: user.id },
      select: { role: true },
    });
    return { ...user, role };
  }

  // Cron entry point: closes every ACTIVE attachment past its expiresAt.
  public async expireDueSessions(): Promise<number> {
    const dueSessions = await supportSessionRepository.find({
      where: { status: "ACTIVE", expiresAt: LessThanOrEqual(new Date()) },
    });
    for (const session of dueSessions) {
      await this.expire(session, "CRON");
    }
    return dueSessions.length;
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

  private async expire(
    session: SupportSessionTable,
    trigger: "LOGIN" | "CRON"
  ): Promise<void> {
    await this.closeSession(session, "EXPIRED", trigger);
  }

  private assertSupervisorAllowed(supervisor: UserAdminAuthenticated): void {
    const email = supervisor.email?.toLowerCase() ?? "";
    if (!email.endsWith(SUPPORT_MODE_ALLOWED_EMAIL_DOMAIN)) {
      throw new ForbiddenException("SUPPORT_MODE_NOT_ALLOWED");
    }
  }

  // The "support" role can't renew a password, so it must be valid on the
  // admin's own account before attaching it — checked against `expiresAt` so
  // it can't expire midway through the attachment either.
  private assertPasswordValidDuringAttachment(
    account: UserStructure,
    expiresAt: Date
  ): void {
    const passwordStatus = getPasswordChangeStatus(
      account.passwordLastUpdate,
      account.createdAt,
      expiresAt
    );
    if (passwordStatus === "EXPIRED") {
      throw new BadRequestException("SUPPORT_TARGET_PASSWORD_EXPIRED");
    }
  }

  // Creates the ACTIVE attachment
  private async attach({
    supervisor,
    structureId,
    account,
    startDate,
    expiresAt,
  }: {
    supervisor: UserAdminAuthenticated;
    structureId: number;
    account: UserStructureTable;
    startDate: Date;
    expiresAt: Date;
  }): Promise<{
    session: SupportSessionTable;
    replacedSession: SupportSessionTable | null;
  }> {
    return myDataSource.transaction(async (manager) => {
      // Serializes concurrent activations on this account: the partial
      // unique index alone can't stop two requests from both seeing "no
      // active row" before either commits.
      await acquireAdvisoryXactLock(manager, `support-attach:${account.id}`);

      const sessionRepo = manager.getRepository(SupportSessionTable);
      const replacedSession = await sessionRepo.findOne({
        where: { targetUserStructureId: account.id, status: "ACTIVE" },
      });

      let originalRole: UserStructureRole;
      if (replacedSession) {
        // The account is already "support": carry the real role forward
        // instead of snapshotting "support" as the original one.
        originalRole = replacedSession.originalRole ?? account.role;
        await sessionRepo.update(
          { uuid: replacedSession.uuid },
          {
            status: "REVOKED",
            revokedAt: new Date(),
            revokedBy: supervisor.email,
            revokedReason: "REPLACED",
          }
        );
      } else {
        originalRole = account.role;
        await manager
          .getRepository(UserStructureTable)
          .update({ id: account.id }, { role: "support" });
      }

      const session = await sessionRepo.save(
        new SupportSessionTable({
          supervisorId: supervisor.id,
          supervisorEmail: supervisor.email,
          structureId,
          targetUserStructureId: account.id,
          startDate,
          expiresAt,
          status: "ACTIVE",
          originalRole,
        })
      );

      return { session, replacedSession };
    });
  }

  // Single exit point of an attachment (revoke, expiry, logout): ends the
  // structure session, restores the account's real role, and closes the row.
  // A REPLACED attachment does not go through here: the account stays in
  // support mode, attached to another structure.
  private async closeSession(
    session: SupportSessionTable,
    reason: SupportSessionRevokedReason,
    revokedBy: string,
    logContext: Record<string, unknown> & SecurityLogRequestContext = {}
  ): Promise<void> {
    if (session.status !== "ACTIVE") {
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

    const { ip, userAgent, ...context } = logContext;
    await logSecurityEvent({
      action:
        reason === "EXPIRED"
          ? "SUPPORT_SESSION_EXPIRED"
          : "SUPPORT_SESSION_REVOKED",
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

  // Matched by email: the admin's structure account carries their real
  // day-to-day role, and is only "support" while attached.
  private async findOwnAccount(
    supervisor: UserAdminAuthenticated
  ): Promise<UserStructureTable> {
    const account = await userStructureRepository.findOne({
      where: { email: supervisor.email, status: "ACTIVE" },
    });
    if (!account) {
      throw new BadRequestException("SUPPORT_TARGET_ACCOUNT_NOT_FOUND");
    }
    return account;
  }
}
