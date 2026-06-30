import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";

import {
  appLogSecurityRepository,
  userStructureRepository,
  userSupervisorRepository,
  userUsagerRepository,
} from "../../../../database";
import { isCronEnabled } from "../../../../config/services/isCronEnabled.service";
import { UserProfile } from "../../../../_common/model";
import { appLogger } from "../../../../util";
import { getBackoffTime } from "../userSecurityEventHistoryManager.service";
import { userStatusManager } from "../userStatusManager.service";

// Failed-auth lockouts mark accounts as TEMPORARILY_BLOCKED but only clear
// the flag the next time the user tries to log in (or change their password).
// Without a sweep, the admin "Suivi sécurité" stays stale: a user blocked at
// 12:00 still shows "Blocage temporaire" hours after the backoff window
// elapsed. This cron walks the three user tables, recomputes the live
// backoff for each TEMPORARILY_BLOCKED row, and reactivates those past their
// window.
@Injectable()
export class ExpiredTemporaryBlockCleaner {
  @Cron(CronExpression.EVERY_30_MINUTES, { timeZone: "Europe/Paris" })
  @SentryCron("clear-expired-temporary-blocks", {
    schedule: {
      type: "crontab",
      value: CronExpression.EVERY_30_MINUTES,
    },
    timezone: "Europe/Paris",
    checkinMargin: 5,
    maxRuntime: 10,
  })
  public async clearExpiredTemporaryBlocksCron(): Promise<void> {
    if (!isCronEnabled()) {
      appLogger.debug(
        "[CRON] [clearExpiredTemporaryBlocksCron] Disabled by config"
      );
      return;
    }

    const cleared = {
      structure: await sweepProfile("structure"),
      supervisor: await sweepProfile("supervisor"),
      usager: await sweepProfile("usager"),
    };

    const total = cleared.structure + cleared.supervisor + cleared.usager;
    if (total > 0) {
      appLogger.info(
        `[CRON] [clearExpiredTemporaryBlocksCron] Cleared ${total} stale lock(s)`,
        cleared
      );
    }
  }
}

async function sweepProfile(userProfile: UserProfile): Promise<number> {
  const repo =
    userProfile === "structure"
      ? userStructureRepository
      : userProfile === "supervisor"
      ? userSupervisorRepository
      : userUsagerRepository;

  const blocked = await repo.find({
    where: { status: "TEMPORARILY_BLOCKED" },
    select: { id: true },
  });

  let cleared = 0;
  for (const user of blocked) {
    if (await hasActiveThrottleLock(userProfile, user.id)) {
      continue;
    }
    const backoff = await getBackoffTime({ userProfile, userId: user.id });
    if (backoff !== null) {
      continue;
    }
    await userStatusManager.clearTemporaryBlock({
      userProfile,
      userId: user.id,
    });
    cleared++;
  }
  return cleared;
}

// Throttler-induced lockouts (suspect UA / quota on a login endpoint) are not
// counted in `getBackoffTime` since they don't write FAILED_AUTH events. They
// stamp a `lockUntil` in the BLOCK_USER log context instead; honor it here.
async function hasActiveThrottleLock(
  userProfile: UserProfile,
  userId: number
): Promise<boolean> {
  const idColumn =
    userProfile === "structure"
      ? "userStructureId"
      : userProfile === "supervisor"
      ? "userSupervisorId"
      : "userUsagerId";

  const row = await appLogSecurityRepository
    .createQueryBuilder("log")
    .where(`log."${idColumn}" = :userId`, { userId })
    .andWhere(`log.action = 'BLOCK_USER'`)
    .andWhere(`log.context->>'lockType' = 'temporary'`)
    .andWhere(`(log.context->>'lockUntil')::timestamptz > NOW()`)
    .limit(1)
    .getOne();

  return row !== null;
}
