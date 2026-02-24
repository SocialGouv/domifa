import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";
import { LessThanOrEqual } from "typeorm";
import { monitoringBatchProcessSimpleCountRunner } from ".";
import { MonitoringBatchProcessTrigger } from "../..";
import { appLogger } from "../../../util";

import { monitoringBatchProcessRepository } from "./monitoringBatchProcessRepository.service";

import { isCronEnabled } from "../../../config/services/isCronEnabled.service";
import { endOfDay, subDays } from "date-fns";

@Injectable()
export class MonitoringCleaner {
  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  @SentryCron("purge-obsolete-monitoring-data", {
    schedule: {
      type: "crontab",
      value: CronExpression.EVERY_DAY_AT_11PM,
    },
    timezone: "Europe/Paris",
    checkinMargin: 10,
    maxRuntime: 15,
  })
  public async purgeObsoleteDataCron() {
    if (!isCronEnabled()) {
      appLogger.debug("[CRON] [purgeObsoleteDataCron] Disabled by config");
      return;
    }
    await this.purgeObsoleteData("cron");
  }

  public async purgeObsoleteData(trigger: MonitoringBatchProcessTrigger) {
    appLogger.warn("[CRON] [purgeObsoleteDataCron] Start");

    const limitDate = endOfDay(subDays(new Date(), 7));

    await monitoringBatchProcessSimpleCountRunner.monitorProcess(
      {
        processId: "purge-obsolete-monitoring-data",
        trigger,
      },
      async ({
        monitorTotal,
        monitorSuccess,
        monitorError,
        monitorResults,
      }) => {
        const results = {
          purgedMonitoringBatchsCount: 0,
          errorReportSent: false,
        };
        monitorTotal(3);

        try {
          results.purgedMonitoringBatchsCount =
            await purgeObsoleteMonitoringBatchProcess({ limitDate });
          monitorSuccess();
        } catch (err: any) {
          monitorError(err);
        }

        monitorResults(results);
      }
    );
  }
}

async function purgeObsoleteMonitoringBatchProcess({
  limitDate,
}: {
  limitDate: Date;
}) {
  const affected = await monitoringBatchProcessRepository.countBy({
    status: "success",
    endDate: LessThanOrEqual(limitDate),
  });
  await monitoringBatchProcessRepository.delete({
    status: "success",
    endDate: LessThanOrEqual(limitDate),
  });
  return affected;
}
