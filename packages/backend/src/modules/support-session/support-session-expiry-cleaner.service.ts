import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";

import { isCronEnabled } from "../../config/services/isCronEnabled.service";
import { appLogger } from "../../util";
import { SupportSessionService } from "./support-session.service";

@Injectable()
export class SupportSessionExpiryCleaner {
  constructor(private readonly supportSessionService: SupportSessionService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  @SentryCron("support-session-expiry-cleaner", {
    schedule: {
      type: "crontab",
      value: CronExpression.EVERY_10_MINUTES,
    },
    timezone: "Europe/Paris",
    checkinMargin: 5,
    maxRuntime: 5,
  })
  public async cleanExpiredSupportSessionsCron() {
    if (!isCronEnabled()) {
      appLogger.debug(
        "[CRON] [cleanExpiredSupportSessionsCron] Disabled by config"
      );
      return;
    }

    const count = await this.supportSessionService.expireDueSessions();
    if (count > 0) {
      appLogger.info(
        `[CRON] [cleanExpiredSupportSessionsCron] ${count} session(s) support expirée(s)`
      );
    }
  }
}
