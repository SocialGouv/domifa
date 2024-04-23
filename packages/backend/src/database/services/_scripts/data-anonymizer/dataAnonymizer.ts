import { domifaConfig } from "../../../../config";
import { appLogger } from "../../../../util";
import { dateInteractionsAnonymizer } from "./dataInteractionsAnonymizer";
import { dataMessageEmailAnonymizer } from "./dataMessageEmailAnonymizer";
import { dataMessageSmsAnonymizer } from "./dataMessageSmsAnonymizer";
import { dataMonitoringAnonymizer } from "./dataMonitoringAnonymizer";
import { dataStructureAnonymizer } from "./dataStructureAnonymizer";
import { dataUsagerAnonymizer } from "./dataUsagerAnonymizer";
import { dataUserStructureAnonymizer } from "./dataUserStructureAnonymizer";
import { dataUserUsagerAnonymizer } from "./dataUserUsagerAnonymizer";

export const dataAnonymizer = {
  anonymize,
};

async function anonymize() {
  appLogger.debug(`[dataAnonymizer] UP`);
  const envId = domifaConfig().envId;
  if (envId === "dev" || envId === "preprod" || envId === "local") {
    appLogger.warn(`[dataAnonymizer] DB anonymisation ON (env:${envId})`);
    await dataUserStructureAnonymizer.anonymizeUsersStructure();
    await dataMessageSmsAnonymizer.anonymizeSms();
    await dataMessageEmailAnonymizer.anonymizeEmail();
    await dataMonitoringAnonymizer.anonymizeMonitoring();
    await dataMonitoringAnonymizer.anonymizeLogs();
    await dataUsagerAnonymizer.anonymizeUsagers();
    await dataMonitoringAnonymizer.anonymizeTokens();
    await dataStructureAnonymizer.anonymizeStructureDocs();
    await dataStructureAnonymizer.anonymizeStructures();
    await dataUsagerAnonymizer.anonymizeNotes();
    await dataUsagerAnonymizer.anonymizeOptionsHistory();
    await dataUsagerAnonymizer.anonymizeUsagerDocs();
    await dataUserUsagerAnonymizer.anonymizeUsersUsager();
    await dataUsagerAnonymizer.anonymizeEntretiens();
    await dateInteractionsAnonymizer.anonymizeInteractions();
  } else {
    appLogger.warn(`[dataAnonymizer] DB anonymisation OFF (env:${envId})`);
  }
}
