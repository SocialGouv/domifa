import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";

import { LessThanOrEqual } from "typeorm";
import { isCronEnabled } from "../../../../config/services/isCronEnabled.service";
import { expiredTokenRepositiory } from "../../../../database";
import { appLogger } from "../../../../util";
import { subDays } from "date-fns";

@Injectable()
export class ExpiredTokenCleaner {
  @Cron(CronExpression.EVERY_DAY_AT_10PM)
  @SentryCron("purge-expired-tokens", {
    schedule: {
      type: "crontab",
      value: CronExpression.EVERY_DAY_AT_10PM,
    },
    timezone: "Europe/Paris",
    checkinMargin: 10,
    maxRuntime: 15,
  })
  public async purgeExpiredTokensCron() {
    if (!isCronEnabled()) {
      appLogger.debug("[CRON] [purgeExpiredTokensCron] Disabled by config");
      return;
    }

    const limitDate = subDays(new Date(), 7);

    await expiredTokenRepositiory.delete({
      createdAt: LessThanOrEqual(limitDate),
    });
  }
}
