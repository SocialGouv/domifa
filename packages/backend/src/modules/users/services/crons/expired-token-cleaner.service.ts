import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";

import { LessThanOrEqual } from "typeorm";
import { isCronEnabled } from "../../../../config/services/isCronEnabled.service";
import { expiredTokenRepositiory } from "../../../../database";
import { appLogger } from "../../../../util";
import { subDays } from "date-fns";

@Injectable()
export class ExpiredTokenCleaner {
  @Cron(CronExpression.EVERY_DAY_AT_10PM)
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
