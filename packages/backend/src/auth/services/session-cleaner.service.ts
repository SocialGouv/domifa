import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";
import { Not, IsNull, Raw } from "typeorm";
import { domifaConfig } from "../../config";
import { isCronEnabled } from "../../config/services/isCronEnabled.service";
import {
  userStructureSecurityRepository,
  userSupervisorSecurityRepository,
} from "../../database";
import { HistoricalUserSession } from "../../_common/model";
import { appLogger } from "../../util";

@Injectable()
export class SessionCleanerService {
  @Cron(CronExpression.EVERY_DAY_AT_3AM, {
    timeZone: "Europe/Paris",
  })
  @SentryCron("session-cleanup", {
    schedule: {
      type: "crontab",
      value: CronExpression.EVERY_DAY_AT_3AM,
    },
    timezone: "Europe/Paris",
    checkinMargin: 10,
    maxRuntime: 15,
  })
  public async cleanupExpiredSessionsCron(): Promise<void> {
    if (!isCronEnabled()) {
      appLogger.debug("[CRON] [session-cleanup] Disabled by config");
      return;
    }
    await this.cleanupExpiredSessions();
  }

  public async cleanupExpiredSessions(): Promise<void> {
    const structure = await this.processStructure();
    const supervisor = await this.processSupervisor();

    appLogger.info({
      event: "session_cleanup",
      structureExpired: structure.expired,
      structurePurged: structure.purged,
      supervisorExpired: supervisor.expired,
      supervisorPurged: supervisor.purged,
    });
  }

  // Repositories dispatched per profile because save() overloads don't unify
  // across the two entity types.
  private async processStructure(): Promise<{
    expired: number;
    purged: number;
  }> {
    const now = new Date();
    const purgeBefore = computePurgeBefore(now);
    let expired = 0;
    let purged = 0;

    // Active sessions to expire — selected via the indexed flat column.
    const activeRows = await userStructureSecurityRepository.find({
      where: { fingerprintHash: Not(IsNull()) },
    });
    for (const row of activeRows) {
      if (!row.currentSession) continue;
      if (new Date(row.currentSession.expiresAt).getTime() > now.getTime()) {
        continue;
      }
      const closed: HistoricalUserSession = {
        ...row.currentSession,
        closedAt: now.toISOString(),
        closedReason: "EXPIRED",
      };
      appLogger.info({
        event: "session_closed",
        profile: "structure",
        userId: row.userId,
        sessionUuid: closed.uuid,
        reason: "EXPIRED",
      });
      await userStructureSecurityRepository.save({
        uuid: row.uuid,
        userId: row.userId,
        structureId: row.structureId,
        currentSession: null,
        sessionsHistory: [closed, ...(row.sessionsHistory ?? [])],
      });
      expired += 1;
    }

    // Purge stale historical entries.
    const historyRows = await userStructureSecurityRepository.find({
      where: {
        sessionsHistory: Raw((alias) => `jsonb_array_length(${alias}) > 0`),
      },
    });
    for (const row of historyRows) {
      const before = row.sessionsHistory ?? [];
      const after = before.filter(
        (s) => new Date(s.closedAt).getTime() >= purgeBefore.getTime()
      );
      if (after.length !== before.length) {
        await userStructureSecurityRepository.save({
          uuid: row.uuid,
          userId: row.userId,
          structureId: row.structureId,
          currentSession: row.currentSession,
          sessionsHistory: after,
        });
        purged += before.length - after.length;
      }
    }

    return { expired, purged };
  }

  private async processSupervisor(): Promise<{
    expired: number;
    purged: number;
  }> {
    const now = new Date();
    const purgeBefore = computePurgeBefore(now);
    let expired = 0;
    let purged = 0;

    const activeRows = await userSupervisorSecurityRepository.find({
      where: { fingerprintHash: Not(IsNull()) },
    });
    for (const row of activeRows) {
      if (!row.currentSession) continue;
      if (new Date(row.currentSession.expiresAt).getTime() > now.getTime()) {
        continue;
      }
      const closed: HistoricalUserSession = {
        ...row.currentSession,
        closedAt: now.toISOString(),
        closedReason: "EXPIRED",
      };
      appLogger.info({
        event: "session_closed",
        profile: "supervisor",
        userId: row.userId,
        sessionUuid: closed.uuid,
        reason: "EXPIRED",
      });
      await userSupervisorSecurityRepository.save({
        uuid: row.uuid,
        userId: row.userId,
        currentSession: null,
        sessionsHistory: [closed, ...(row.sessionsHistory ?? [])],
      });
      expired += 1;
    }

    const historyRows = await userSupervisorSecurityRepository.find({
      where: {
        sessionsHistory: Raw((alias) => `jsonb_array_length(${alias}) > 0`),
      },
    });
    for (const row of historyRows) {
      const before = row.sessionsHistory ?? [];
      const after = before.filter(
        (s) => new Date(s.closedAt).getTime() >= purgeBefore.getTime()
      );
      if (after.length !== before.length) {
        await userSupervisorSecurityRepository.save({
          uuid: row.uuid,
          userId: row.userId,
          currentSession: row.currentSession,
          sessionsHistory: after,
        });
        purged += before.length - after.length;
      }
    }

    return { expired, purged };
  }
}

function computePurgeBefore(now: Date): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - domifaConfig().security.sessionPurgeAfterDays);
  return d;
}
