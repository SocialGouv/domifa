import { domifaConfig } from "../../../../config";
import { appLogger } from "../../../../util";
import { dataMessageEmailAnonymizer } from "./dataMessageEmailAnonymizer";
import { dataMessageSmsAnonymizer } from "./dataMessageSmsAnonymizer";
import { dataStructureAnonymizer } from "./dataStructureAnonymizer";
import { dataUsagerAnonymizer } from "./dataUsagerAnonymizer";
// import { dataUsagerHistoryAnonymizer } from "./dataUsagerHistoryAnonymizer";
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
    await dataMessageEmailAnonymizer.anonymizeEmail();
    await dataMessageSmsAnonymizer.anonymizeSms();
    await dataStructureAnonymizer.anonymizeStructures();
    await dataUserStructureAnonymizer.anonymizeUsersStructure();
    await dataUserUsagerAnonymizer.anonymizeUsersUsager();
    await dataUsagerAnonymizer.anonymizeUsagers();
    // await dataUsagerHistoryAnonymizer.anonymizeUsagersHistory({ app });
  } else {
    appLogger.warn(`[dataAnonymizer] DB anonymisation OFF (env:${envId})`);
  }
}
