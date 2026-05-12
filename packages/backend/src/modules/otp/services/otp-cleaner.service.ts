import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";
import { LessThanOrEqual } from "typeorm";
import { subDays } from "date-fns";

import { isCronEnabled } from "../../../config/services/isCronEnabled.service";
import { otpRepository } from "../../../database";
import { appLogger } from "../../../util";

@Injectable()
export class OtpCleaner {
  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  @SentryCron("purge-expired-otps", {
    schedule: {
      type: "crontab",
      value: CronExpression.EVERY_DAY_AT_11PM,
    },
    timezone: "Europe/Paris",
    checkinMargin: 10,
    maxRuntime: 15,
  })
  public async purgeExpiredOtpsCron(): Promise<void> {
    if (!isCronEnabled()) {
      appLogger.debug("[CRON] [purgeExpiredOtpsCron] Disabled by config");
      return;
    }

    const limitDate = subDays(new Date(), 7);

    const result = await otpRepository.delete({
      expiresAt: LessThanOrEqual(limitDate),
    });

    appLogger.info(
      `[CRON] [purgeExpiredOtpsCron] Purged ${
        result.affected ?? 0
      } expired OTPs`
    );
  }
}
