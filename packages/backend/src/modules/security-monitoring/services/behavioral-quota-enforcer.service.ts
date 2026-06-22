import { Injectable, Logger } from "@nestjs/common";
import { format } from "date-fns";
import { utcToZonedTime, zonedTimeToUtc } from "date-fns-tz";
import { MoreThanOrEqual } from "typeorm";

import { domifaConfig } from "../../../config";
import {
  appLogsRepository,
  appLogSecurityRepository,
  AppLogSecurityTable,
} from "../../../database";
import { UserStructureAuthenticated } from "../../../_common/model";
import { userStatusManager } from "../../users/services";
import {
  QUOTA_BLOCK_LABEL,
  QUOTA_BLOCK_REASON,
} from "./behavioral-quota-enforcer.constants";
import {
  EnforceableQuotaKind,
  QuotaEnforcementResult,
} from "./behavioral-quota-enforcer.types";

const PARIS_TZ = "Europe/Paris";

@Injectable()
export class BehavioralQuotaEnforcerService {
  private readonly logger = new Logger("BehavioralQuotaEnforcerService");

  public async enforceBeforeAction(params: {
    action: EnforceableQuotaKind;
    user: UserStructureAuthenticated;
  }): Promise<QuotaEnforcementResult> {
    const { action, user } = params;
    const threshold = this.thresholdFor(action);

    const startOfDayUtc = this.parisStartOfTodayUtc();
    const todayCount = await appLogsRepository.count({
      where: {
        action,
        structureId: user.structureId,
        createdAt: MoreThanOrEqual(startOfDayUtc),
      },
    });

    if (todayCount < threshold) {
      return { allowed: true };
    }

    const alreadyBlocked = await this.hasStructureAlreadyBlockedToday({
      action,
      structureId: user.structureId,
      since: startOfDayUtc,
    });
    if (alreadyBlocked) {
      return { allowed: false, blockedNow: false };
    }

    await userStatusManager.markUserAsBlocked({
      userProfile: "structure",
      userId: user.id,
    });
    await this.writeBlockUserLog({ action, user, todayCount, threshold });
    this.logger.warn(
      `[QUOTA_BLOCK] user_structure id=${user.id} structureId=${user.structureId} action=${action} count=${todayCount} threshold=${threshold}`
    );

    return { allowed: false, blockedNow: true };
  }

  private thresholdFor(action: EnforceableQuotaKind): number {
    const { quotas } = domifaConfig();
    return action === "USAGERS_DOCS_DOWNLOAD"
      ? quotas.usagersDocsDownloadBlockPerDay
      : quotas.usagersDeleteBlockPerDay;
  }

  private parisStartOfTodayUtc(): Date {
    const now = new Date();
    const parisNow = utcToZonedTime(now, PARIS_TZ);
    const dayKey = format(parisNow, "yyyy-MM-dd");
    return zonedTimeToUtc(`${dayKey}T00:00:00`, PARIS_TZ);
  }

  private async hasStructureAlreadyBlockedToday(params: {
    action: EnforceableQuotaKind;
    structureId: number;
    since: Date;
  }): Promise<boolean> {
    const reason = QUOTA_BLOCK_REASON[params.action];
    const count = await appLogSecurityRepository
      .createQueryBuilder("log")
      .where("log.action = :action", { action: "BLOCK_USER" })
      .andWhere(`log."structureId" = :structureId`, {
        structureId: params.structureId,
      })
      .andWhere(`log."createdAt" >= :since`, { since: params.since })
      .andWhere(`log.context->>'reason' = :reason`, { reason })
      .getCount();
    return count > 0;
  }

  private async writeBlockUserLog(params: {
    action: EnforceableQuotaKind;
    user: UserStructureAuthenticated;
    todayCount: number;
    threshold: number;
  }): Promise<void> {
    const { action, user, todayCount, threshold } = params;
    try {
      await appLogSecurityRepository.save(
        new AppLogSecurityTable({
          userStructureId: user.id,
          userType: "user_structure",
          structureId: user.structureId,
          role: user.role,
          action: "BLOCK_USER",
          context: {
            autoBlocked: true,
            triggeredBy: "BehavioralQuotaEnforcerService",
            reason: QUOTA_BLOCK_REASON[action],
            label: QUOTA_BLOCK_LABEL[action],
            kind: action,
            count: todayCount,
            threshold,
            email: user.email,
            structureId: user.structureId,
            role: user.role,
          },
        })
      );
    } catch (err) {
      this.logger.error(
        `[QUOTA_BLOCK] failed to write BLOCK_USER log for user ${user.id}: ${
          (err as Error).message
        }`
      );
    }
  }
}
