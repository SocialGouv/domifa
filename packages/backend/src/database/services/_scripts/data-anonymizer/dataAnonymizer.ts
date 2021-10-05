import { INestApplication } from "@nestjs/common";
import { domifaConfig } from "../../../../config";
import { appLogger } from "../../../../util";
import { dataSmsAnonymizer } from "./dataSmsAnonymizer";
import { dataStructureAnonymizer } from "./dataStructureAnonymizer";
import { dataUsagerAnonymizer } from "./dataUsagerAnonymizer";
import { dataUserStructureAnonymizer } from "./dataUserStructureAnonymizer";
import { dataUserUsagerAnonymizer } from "./dataUserUsagerAnonymizer";

export const dataAnonymizer = {
  anonymize,
};

async function anonymize(app: INestApplication) {
  appLogger.debug(`[dataAnonymizer] UP`);
  const envId = domifaConfig().envId;
  if (envId === "dev" || envId === "preprod" || envId === "formation") {
    appLogger.warn(`[dataAnonymizer] DB anonymisation ON (env:${envId})`);
    await dataSmsAnonymizer.anonymizeSms();
    await dataStructureAnonymizer.anonymizeStructures();
    await dataUserStructureAnonymizer.anonymizeUsersStructure({ app });
    await dataUserUsagerAnonymizer.anonymizeUsersUsager({ app });
    await dataUsagerAnonymizer.anonymizeUsagers({ app });
  } else {
    appLogger.warn(`[dataAnonymizer] DB anonymisation OFF (env:${envId})`);
  }
}
