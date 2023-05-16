import { appLogger } from "../../../../util";
import { monitoringBatchProcessRepository } from "../../monitoring";

export const dataMonitoringAnonymizer = {
  anonymizeMonitoring,
};

async function anonymizeMonitoring() {
  appLogger.warn(`[dataContactAnonymizer] Delete monitoring data`);
  await monitoringBatchProcessRepository.delete({});
}
