import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { LessThanOrEqual } from "typeorm";
import { monitoringBatchProcessSimpleCountRunner } from ".";
import { MonitoringBatchProcessTrigger } from "../..";
import { domifaConfig } from "../../../config";
import { adminBatchsErrorReportEmailSender } from "../../../mails/services/templates-renderers";
import { appLogger } from "../../../util";
import { MonitoringBatchProcessId } from "../../entities";
import { messageEmailRepository } from "../message-email";
import { AdminBatchsErrorReportModel } from "./AdminBatchsErrorReportModel.type";
import { monitoringBatchProcessRepository } from "./monitoringBatchProcessRepository.service";

import { isCronEnabled } from "../../../config/services/isCronEnabled.service";
import { endOfDay, sub } from "date-fns";

@Injectable()
export class MonitoringCleaner {
  @Cron(domifaConfig().cron.monitoringCleaner.crontime)
  public async purgeObsoleteDataCron() {
    if (!isCronEnabled()) {
      appLogger.debug(`[CRON] [purgeObsoleteDataCron] Disabled by config`);
      return;
    }
    await this.purgeObsoleteData("cron");
  }

  public async purgeObsoleteData(trigger: MonitoringBatchProcessTrigger) {
    appLogger.warn(`[CRON] [purgeObsoleteDataCron] Start`);
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
          purgedMessageEmailsCount: 0,
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
        try {
          results.purgedMessageEmailsCount =
            await purgeObsoleteMessageEmailProcess({ limitDate });
          monitorSuccess();
        } catch (err: any) {
          monitorError(err);
        }

        try {
          results.errorReportSent = await sendErrorReport();
          monitorSuccess();
        } catch (err: any) {
          monitorError(err);
        }

        monitorResults(results);
      }
    );
  }
}

async function purgeObsoleteMessageEmailProcess({
  limitDate,
}: {
  limitDate: Date;
}) {
  const res = await messageEmailRepository.delete({
    status: "sent",
    sendDate: LessThanOrEqual(limitDate),
  });
  return res.affected;
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

async function sendErrorReport(): Promise<boolean> {
  const monitoringBatchsInError = await monitoringBatchProcessRepository.find({
    where: {
      status: "error",
      alertMailSent: false,
    },
    order: {
      endDate: "DESC",
    },
  });

  if (monitoringBatchsInError.length) {
    appLogger.error(`Errors detected in last batchs - ${Date.now()}`);

    const model: AdminBatchsErrorReportModel = {
      errorsCount: monitoringBatchsInError.length,
      processIds: monitoringBatchsInError.reduce((acc, item) => {
        if (!acc.includes(item.processId)) {
          acc.push(item.processId);
        }
        return acc;
      }, [] as MonitoringBatchProcessId[]),
      lastErrorDate: monitoringBatchsInError[0].endDate,
      lastErrorMessage: monitoringBatchsInError[0].errorMessage,
    };
    await adminBatchsErrorReportEmailSender.sendMail(model);

    monitoringBatchsInError.forEach((x) => {
      x.alertMailSent = true;
    });
    await monitoringBatchProcessRepository.save(monitoringBatchsInError);

    return true;
  }
  return false;
}
