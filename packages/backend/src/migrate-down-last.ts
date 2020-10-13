import { Logger } from "@nestjs/common";
import { bootstrapApplication } from "./app.bootstrap";
import { appLogger } from "./util";
import { umzugMigrationManager } from "./_migrations/umzug-migration-manager";

(async () => {
  appLogger.warn(`[${__filename}] Starting app...`);
  const app = await bootstrapApplication();
  try {
    await umzugMigrationManager.migrateDownLast({ app });
  } finally {
    appLogger.warn(`[${__filename}] Closing app...`);
    await app.close();
    process.exit(0);
  }
})();
