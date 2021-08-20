import { appLogger } from "../../../../util";
import { MonitoringBatchProcessTable } from "../../../entities/monitoring";
import { MonitoringBatchProcess } from "../../../entities/monitoring/MonitoringBatchProcess.type";
import { monitoringBatchProcessRepository } from "../monitoringBatchProcessRepository.service";
import { MonitoringBatchProcessSimpleCountDetails } from "./MonitoringBatchProcessSimpleCountDetails.type";

export const monitoringBatchProcessSimpleCountRunner = {
  monitorProcess,
};

async function monitorProcess(
  {
    processId,
    trigger,
  }: Pick<
    MonitoringBatchProcess<MonitoringBatchProcessSimpleCountDetails>,
    "processId" | "trigger"
  >,
  process: ({
    monitorTotal,
    monitorSuccess,
    monitorError,
    monitorResults,
  }: {
    monitorResults: (results: any) => void;
    monitorTotal: (total: number) => void;
    monitorSuccess: (count?: number) => void;
    monitorError: (error: Error, { count }?: { count?: number }) => number;
  }) => Promise<void>
) {
  appLogger.debug(
    `[${__filename}] Running "${processId}" process using ${trigger} trigger...`
  );

  const monitoringBatchProcess: Partial<
    MonitoringBatchProcess<MonitoringBatchProcessSimpleCountDetails>
  > = {
    processId,
    trigger,
    beginDate: new Date(),
    details: {
      total: 0,
      success: 0,
      errors: 0,
      skipped: 0,
    },
  };

  try {
    const result = await process({
      monitorResults: (results) => {
        monitoringBatchProcess.details.results = results;
      },
      monitorTotal: (total) => {
        monitoringBatchProcess.details.total = total;
      },
      monitorSuccess: (count = 1) => {
        monitoringBatchProcess.details.success += count;
      },
      monitorError: (err: Error, { count = 1 } = { count: 1 }) => {
        monitoringBatchProcess.errorMessage = err.message;
        appLogger.warn(
          `[monitorProcess] Error during "${processId}" process: ${err.message}`,
          {
            sentryBreadcrumb: true,
          }
        );
        monitoringBatchProcess.details.errors += count;
        return monitoringBatchProcess.details.errors;
      },
    });

    if (monitoringBatchProcess.details.errors) {
      appLogger.error(`[monitorProcess] Error during "${processId}" process`);
    }
    monitoringBatchProcess.status =
      monitoringBatchProcess.details.success ===
      monitoringBatchProcess.details.total
        ? "success"
        : "error";

    return result;
  } catch (err) {
    monitoringBatchProcess.status = "error";
    monitoringBatchProcess.errorMessage = (err as Error).message;
    appLogger.error(
      `[monitorProcess] Unexpected error during "${processId}" process`,
      {
        error: err as Error,
        sentry: true,
      }
    );
  } finally {
    monitoringBatchProcess.details.skipped =
      monitoringBatchProcess.details.total -
      monitoringBatchProcess.details.success -
      monitoringBatchProcess.details.errors;

    if (monitoringBatchProcess.status === "success") {
      appLogger.debug(
        `[monitorProcess] "${processId}" process SUCCESS: ${monitoringBatchProcess.details.success}/${monitoringBatchProcess.details.total}`
      );
    }

    const monitoringBatchProcessEntity =
      new MonitoringBatchProcessTable<MonitoringBatchProcessSimpleCountDetails>(
        {
          ...monitoringBatchProcess,
          endDate: new Date(),
        }
      );
    // tslint:disable-next-line: no-unsafe-finally
    return monitoringBatchProcessRepository.save(monitoringBatchProcessEntity);
  }
}
