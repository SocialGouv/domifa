import { INestApplication } from "@nestjs/common";
import {
  dataUsagerAnonymizer,
  dataSmsAnonymizer,
  dataStructureAnonymizer,
  dataUserAnonymizer,
} from ".";
import { domifaConfig } from "../../../../config";
import { appLogger } from "../../../../util";

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
    await dataUserAnonymizer.anonymizeUsers({ app });
    await dataUsagerAnonymizer.anonymizeUsagers({ app });
  } else {
    appLogger.warn(`[dataAnonymizer] DB anonymisation OFF (env:${envId})`);
  }
}
