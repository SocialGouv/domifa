import { appLogger } from "../../../../util";
import { expiredTokenRepositiory } from "../../app-logs";
import { monitoringBatchProcessRepository } from "../../monitoring";

export const dataMonitoringAnonymizer = {
  anonymizeMonitoring,
  anonymizeTokens,
};

async function anonymizeMonitoring() {
  appLogger.warn(`[dataMonitoringAnonymizer] Delete monitoring data`);
  await monitoringBatchProcessRepository.delete({});
}

async function anonymizeTokens() {
  appLogger.warn(`[dataMonitoringAnonymizer] Delete expired tokens`);
  await expiredTokenRepositiory.delete({});
}
