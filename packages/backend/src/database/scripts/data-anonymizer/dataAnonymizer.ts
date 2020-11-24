import { INestApplication } from "@nestjs/common";
import { domifaConfig } from "../../../config";
import { appLogger } from "../../../util";
import { dataStructureAnonymizer } from "./dataStructureAnonymizer";
import { dataUsagerAnonymizer } from "./dataUsagerAnonymizer";
import { dataUserAnonymizer } from "./dataUserAnonymizer";

export const dataAnonymizer = {
  anonymize,
};

async function anonymize(app: INestApplication) {
  appLogger.debug(`[dataAnonymizer] UP`);
  const envId = domifaConfig().envId;
  if (envId === "dev" || envId === "preprod") {
    appLogger.warn(`[dataAnonymizer] DB anonymisation ON (env:${envId})`);
    await dataStructureAnonymizer.anonymizeStructures({ app });
    await dataUserAnonymizer.anonymizeUsers({ app });
    await dataUsagerAnonymizer.anonymizeUsagers({ app });
  } else {
    appLogger.warn(`[dataAnonymizer] DB anonymisation OFF (env:${envId})`);
  }
}
