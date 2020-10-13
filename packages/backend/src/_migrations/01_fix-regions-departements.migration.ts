import { INestApplication } from "@nestjs/common";
import { appLogger } from "../util";
import { fixRegionsDepartementsMigration } from "./00_fix-regions-departements.migration";

// same as '00_fix-regions-departements.migration', as it has been fixed since last release

const migrationName = __filename;

async function up(app: INestApplication) {
  appLogger.debug(`[${migrationName}] UP`);
  await fixRegionsDepartementsMigration.updateStructures({ app });
}

async function down(app: INestApplication) {
  appLogger.debug(`[${migrationName}] DOWN`);
  // await of(undefined).toPromise();
}

export { up, down };
