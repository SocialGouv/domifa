import { Logger } from "@nestjs/common";
import { bootstrapApplication } from "./app.bootstrap";
import { appLogger } from "./util";
import { umzugMigrationManager } from "./_migrations/umzug-migration-manager";

(async () => {
  appLogger.warn(`[${__filename}] Starting app...`);
  const app = await bootstrapApplication();

  await umzugMigrationManager.migrateUp({ app });
  await app.listen(3000);
})();
