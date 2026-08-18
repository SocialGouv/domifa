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
  structureRepository,
  supportSessionRepository,
  userStructureRepository,
  userSupervisorRepository,
} from "../../../../database";
import { SupportSessionTable } from "../../../../database/entities/support-session";
import { UserAdminAuthenticated } from "../../../../_common/model";
import { SessionFingerprintService } from "../../../../auth/services/session-fingerprint.service";
import { StructuresAuthService } from "../../../../auth/services/structures-auth.service";
import {
  logSecurityEvent,
  SecurityLogRequestContext,
} from "../../../app-logs/app-log-security-writer";
import { closeSupportSession } from "./support-session-closer";

export const SUPPORT_MODE_ALLOWED_EMAIL_DOMAIN = "@fabrique.social.gouv.fr";
const SUPPORT_SESSION_DURATION_SECONDS = 60 * 60; // 1h

// Highest-privilege active account is impersonated first: it gives the
// admin the same UI surface as the structure's own team lead, closest to
// "put yourself in the user's shoes" for support purposes.
const TARGET_ACCOUNT_ROLE_PRIORITY: UserStructureRole[] = [
  "admin",
  "responsable",
  "simple",
  "agent",
  "facteur",
];

@Injectable()
export class SupportSessionService {
  constructor(
    private readonly structuresAuthService: StructuresAuthService,
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

    const currentSupervisorRow = await userSupervisorRepository.findOne({
      where: { id: supervisor.id },
      select: { id: true, support: true },
    });
    if (currentSupervisorRow?.support) {
      await this.revokeActiveSessionForStructure(
        currentSupervisorRow.support.structureId,
        "REPLACED",
        supervisor.email
      );
    }

    const target = await this.pickTargetAccount(structure.id);

    const startDate = new Date();
    const expiresAt = new Date(
      startDate.getTime() + SUPPORT_SESSION_DURATION_SECONDS * 1000
    );

    const created = await supportSessionRepository.save(
      new SupportSessionTable({
        supervisorId: supervisor.id,
        supervisorEmail: supervisor.email,
        structureId: structure.id,
        targetUserStructureId: target.id,
        startDate,
        expiresAt,
        status: "ACTIVE",
      })
    );

    await userStructureRepository.update(
      { id: target.id },
      { isSupportMode: true }
    );
    await userSupervisorRepository.update(
      { id: supervisor.id },
      { support: { structureId: structure.id, startDate } }
    );

    const session = await this.sessionFingerprintService.startNewSession(
      "structure",
      target.id,
      target.uuid,
      requestContext.ip,
      requestContext.userAgent,
      structure.id
    );

    const { access_token } = this.structuresAuthService.signSupportModeToken(
      target,
      session,
      {
        supportSessionUuid: created.uuid,
        supervisorId: supervisor.id,
        supervisorEmail: supervisor.email,
        expiresInSeconds: SUPPORT_SESSION_DURATION_SECONDS,
      }
    );

    await logSecurityEvent({
      action: "SUPPORT_SESSION_ACTIVATED",
      profile: "supervisor",
      userId: supervisor.id,
      structureId: structure.id,
      role: supervisor.role,
      requestContext,
      context: {
        supportSessionUuid: created.uuid,
        targetUserStructureId: target.id,
      },
    });

    return {
      accessToken: access_token,
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
    await closeSupportSession(session, "MANUAL_REVOKE", supervisor.email, {
      ...requestContext,
      actorSupervisorId: supervisor.id,
    });
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

  // Cron entry point — closes every support session past its expiresAt.
  public async expireDueSessions(): Promise<number> {
    const due = await supportSessionRepository.find({
      where: { status: "ACTIVE" },
    });
    const expired = due.filter((s) => s.expiresAt.getTime() <= Date.now());
    for (const session of expired) {
      await closeSupportSession(session, "EXPIRED", "CRON");
    }
    return expired.length;
  }

  private async revokeActiveSessionForStructure(
    structureId: number,
    reason: SupportSessionRevokedReason,
    revokedBy: string
  ): Promise<void> {
    const session = await supportSessionRepository.findOne({
      where: { structureId, status: "ACTIVE" },
    });
    if (session) {
      await closeSupportSession(session, reason, revokedBy);
    }
  }

  private async pickTargetAccount(structureId: number) {
    const active = await userStructureRepository.find({
      where: { structureId, status: "ACTIVE" },
    });
    if (active.length === 0) {
      throw new BadRequestException("NO_ACTIVE_STRUCTURE_ACCOUNT");
    }
    active.sort((a, b) => {
      const rankA = TARGET_ACCOUNT_ROLE_PRIORITY.indexOf(a.role);
      const rankB = TARGET_ACCOUNT_ROLE_PRIORITY.indexOf(b.role);
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      return a.id - b.id;
    });
    return active[0];
  }
}
