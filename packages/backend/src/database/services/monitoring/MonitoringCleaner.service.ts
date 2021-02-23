import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { LessThanOrEqual } from "typeorm";
import { monitoringBatchProcessSimpleCountRunner } from ".";
import { MonitoringBatchProcessTrigger, typeOrmSearch } from "../..";
import { domifaConfig } from "../../../config";
import { adminBatchsErrorReportEmailSender } from "../../../mails/services/templates-renderers";
import { appLogger } from "../../../util";
import {
  MessageEmail,
  MonitoringBatchProcess,
  MonitoringBatchProcessId,
} from "../../entities";
import { messageEmailRepository } from "../message-email";
import { AdminBatchsErrorReportModel } from "./AdminBatchsErrorReportModel.type";
import { monitoringBatchProcessRepository } from "./monitoringBatchProcessRepository.service";
import moment = require("moment");

@Injectable()
export class MonitoringCleaner {
  constructor() {}

  @Cron(domifaConfig().cron.monitoringCleaner.crontime)
  public async purgeObsoleteDataCron() {
    if (!domifaConfig().cron.enable) {
      return;
    }
    await this.purgeObsoleteData("cron");
  }

  public async purgeObsoleteData(trigger: MonitoringBatchProcessTrigger) {
    const delay = domifaConfig().cron.monitoringCleaner.delay;
    const limitDate: Date = moment()
      .utc()
      .subtract(delay.amount, delay.unit)
      .endOf("day")
      .toDate();

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
          results.purgedMonitoringBatchsCount = await purgeObsoleteMonitoringBatchProcess(
            { limitDate }
          );
          monitorSuccess();
        } catch (err) {
          monitorError(err);
        }
        try {
          results.purgedMessageEmailsCount = await purgeObsoleteMessageEmailProcess(
            { limitDate }
          );
          monitorSuccess();
        } catch (err) {
          monitorError(err);
        }

        try {
          results.errorReportSent = await sendErrorReport();
          monitorSuccess();
        } catch (err) {
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
  const affected = await messageEmailRepository.deleteByCriteria(
    typeOrmSearch<MessageEmail>({
      status: "sent",
      sendDate: LessThanOrEqual(limitDate),
    })
  );
  return affected;
}

async function purgeObsoleteMonitoringBatchProcess({
  limitDate,
}: {
  limitDate: Date;
}) {
  const affected = await monitoringBatchProcessRepository.deleteByCriteria(
    typeOrmSearch<MonitoringBatchProcess>({
      status: "success",
      endDate: LessThanOrEqual(limitDate),
    })
  );
  return affected;
}

async function sendErrorReport(): Promise<boolean> {
  const monitoringBatchsInError = await monitoringBatchProcessRepository.findMany(
    {
      status: "error",
      alertMailSent: false,
    },
    {
      order: {
        endDate: "DESC",
      },
    }
  );
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
