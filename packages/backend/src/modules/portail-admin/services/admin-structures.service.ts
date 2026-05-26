import { Injectable } from "@nestjs/common";

import { NotFoundException } from "@nestjs/common";

import {
  userStructureRepository,
  userStructureSecurityRepository,
  structureRepository,
} from "../../../database";

import {
  StructureAdmin,
  StructureSessionRecord,
  UserStatus,
  UserStructureRole,
  UsersForAdminList,
} from "@domifa/common";
import {
  CurrentUserSession,
  HistoricalUserSession,
} from "../../../_common/model";
import {
  logUserSecurityEvent,
  userSecurityEventHistoryManager,
} from "../../users/services";
import { UserSecurityEvent } from "../../../_common/model/users/user-security/UserSecurityEvent.interface";

@Injectable()
export class AdminStructuresService {
  public async unblockStructureUser(
    uuid: string,
    structureId: number
  ): Promise<{ userId: number }> {
    const target = await userStructureRepository.findOne({
      where: { uuid, structureId },
      select: { id: true },
    });
    if (!target) {
      throw new NotFoundException("USER_NOT_FOUND");
    }
    await userStructureRepository.update(
      { id: target.id, structureId },
      { status: "ACTIVE" }
    );
    // Log the unblock as a fresh event with clearAllEvents so the throttler
    // does not immediately re-block the account on the next login attempt.
    const userSecurity = await userStructureSecurityRepository.findOneByOrFail({
      userId: target.id,
    });
    await logUserSecurityEvent({
      userProfile: "structure",
      userId: target.id,
      userSecurity,
      eventType: "account-unblocked",
      clearAllEvents: true,
    });
    return { userId: target.id };
  }

  public async blockStructureUser(
    uuid: string,
    structureId: number
  ): Promise<{
    userId: number;
    previousStatus: UserStatus;
    previousRole: UserStructureRole;
  }> {
    const target = await userStructureRepository.findOne({
      where: { uuid, structureId },
      select: { id: true, status: true, role: true },
    });
    if (!target) {
      throw new NotFoundException("USER_NOT_FOUND");
    }
    await userStructureRepository.update(
      { id: target.id, structureId },
      { status: "BLOCKED" }
    );
    return {
      userId: target.id,
      previousStatus: target.status,
      previousRole: target.role,
    };
  }

  public async getAdminStructuresListData(): Promise<StructureAdmin[]> {
    return await structureRepository
      .createQueryBuilder("structure")
      .select([
        "structure.*",
        `(SELECT COUNT(DISTINCT u.uuid) FROM usager u WHERE u."structureId" = structure.id) as usagers`,
        `(SELECT COUNT(DISTINCT us.uuid) FROM user_structure us WHERE us."structureId" = structure.id) as users`,
        `(SELECT COUNT(DISTINCT u.uuid) FROM usager u WHERE u."structureId" = structure.id AND u.statut = 'VALIDE') as actifs`,
      ])
      .orderBy("structure.createdAt", "DESC")
      .getRawMany();
  }

  public async getUsersForAdmin(): Promise<UsersForAdminList[]> {
    const users = await userStructureRepository
      .createQueryBuilder("user_structure")
      .leftJoin(
        "structure",
        "structure",
        `user_structure."structureId" = structure.id`
      )
      .leftJoin(
        "user_structure_security",
        "uss",
        `uss."userId" = user_structure.id`
      )
      .select([
        "user_structure.id AS id",
        "user_structure.uuid AS uuid",
        "user_structure.email AS email",
        "user_structure.nom AS nom",
        "prenom",
        "role",
        "user_structure.status as status",
        `user_structure."structureId" AS "structureId"`,
        `user_structure."lastLogin" AS "lastLogin"`,
        `user_structure."passwordLastUpdate" AS "passwordLastUpdate"`,
        `user_structure."createdAt" AS "createdAt"`,
        `structure.uuid AS "structureUuid"`,
        `structure.nom AS "structureName"`,
        `uss."eventsHistory" AS "eventsHistory"`,
        `uss."temporaryTokens" AS "temporaryTokens"`,
      ])
      .orderBy("user_structure.nom", "ASC")
      .getRawMany<UsersForAdminList>();

    return users.map((user) => ({
      ...user,
      eventsHistory: user.eventsHistory ?? [],
      remainingBackoffMinutes:
        userSecurityEventHistoryManager.getBackoffTime(
          (user.eventsHistory ?? []) as UserSecurityEvent[]
        ) ?? null,
    }));
  }

  public async getStructureSessions(
    structureId: number,
    limit: number
  ): Promise<StructureSessionRecord[]> {
    // Flatten currentSession + sessionsHistory across every user of the
    // structure. The jsonb columns are unbounded but a typical structure has
    // <20 users with <SESSION_PURGE_AFTER_DAYS history entries each, so the
    // in-memory sort + slice stays cheap. Keep `limit` enforced to bound the
    // payload regardless.
    type Row = {
      id: number;
      nom: string;
      prenom: string;
      email: string;
      currentSession: CurrentUserSession | null;
      sessionsHistory: HistoricalUserSession[] | null;
    };

    const rows = await userStructureRepository
      .createQueryBuilder("user_structure")
      .leftJoin(
        "user_structure_security",
        "uss",
        `uss."userId" = user_structure.id`
      )
      .select([
        "user_structure.id AS id",
        "user_structure.nom AS nom",
        "user_structure.prenom AS prenom",
        "user_structure.email AS email",
        `uss."currentSession" AS "currentSession"`,
        `uss."sessionsHistory" AS "sessionsHistory"`,
      ])
      .where(`user_structure."structureId" = :structureId`, { structureId })
      .getRawMany<Row>();

    const sessions: StructureSessionRecord[] = [];
    for (const row of rows) {
      const fullName = `${row.prenom ?? ""} ${row.nom ?? ""}`.trim();
      if (row.currentSession) {
        sessions.push({
          uuid: row.currentSession.uuid,
          ipAddress: row.currentSession.ipAddress,
          userAgent: row.currentSession.userAgent,
          createdAt: row.currentSession.createdAt,
          expiresAt: row.currentSession.expiresAt,
          status: "active",
          userId: row.id,
          userFullName: fullName,
          userEmail: row.email,
        });
      }
      for (const past of row.sessionsHistory ?? []) {
        sessions.push({
          uuid: past.uuid,
          ipAddress: past.ipAddress,
          userAgent: past.userAgent,
          createdAt: past.createdAt,
          expiresAt: past.expiresAt,
          closedAt: past.closedAt,
          closedReason: past.closedReason,
          status: "closed",
          userId: row.id,
          userFullName: fullName,
          userEmail: row.email,
        });
      }
    }

    sessions.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return sessions.slice(0, limit);
  }
}
