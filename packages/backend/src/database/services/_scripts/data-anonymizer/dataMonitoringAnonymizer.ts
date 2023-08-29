import { appLogger } from "../../../../util";
import { appLogsRepository, expiredTokenRepositiory } from "../../app-logs";
import { monitoringBatchProcessRepository } from "../../monitoring";

export const dataMonitoringAnonymizer = {
  anonymizeMonitoring,
  anonymizeLogs,
  anonymizeTokens,
};

async function anonymizeMonitoring() {
  appLogger.warn(`[dataMonitoringAnonymizer] Delete monitoring data`);
  await monitoringBatchProcessRepository.delete({});
}

async function anonymizeLogs() {
  appLogger.warn(`[dataMonitoringAnonymizer] Delete logs`);
  await appLogsRepository.delete({});
}

async function anonymizeTokens() {
  appLogger.warn(`[dataMonitoringAnonymizer] Delete expired tokens`);
  await expiredTokenRepositiory.delete({});
}
