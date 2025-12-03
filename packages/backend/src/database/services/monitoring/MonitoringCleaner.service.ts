import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { LessThanOrEqual } from "typeorm";
import { monitoringBatchProcessSimpleCountRunner } from ".";
import { MonitoringBatchProcessTrigger } from "../..";
import { domifaConfig } from "../../../config";
import { appLogger } from "../../../util";

import { monitoringBatchProcessRepository } from "./monitoringBatchProcessRepository.service";

import { isCronEnabled } from "../../../config/services/isCronEnabled.service";
import { endOfDay, sub } from "date-fns";

@Injectable()
export class MonitoringCleaner {
  @Cron(domifaConfig().cron.monitoringCleaner.crontime)
  public async purgeObsoleteDataCron() {
    if (!isCronEnabled()) {
      appLogger.debug("[CRON] [purgeObsoleteDataCron] Disabled by config");
      return;
    }
    await this.purgeObsoleteData("cron");
  }

  public async purgeObsoleteData(trigger: MonitoringBatchProcessTrigger) {
    appLogger.warn("[CRON] [purgeObsoleteDataCron] Start");
    const delay = domifaConfig().cron.monitoringCleaner.delay;

    const limitDate = endOfDay(
      sub(new Date(), {
        [delay.unit]: delay.amount,
      })
    );

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
