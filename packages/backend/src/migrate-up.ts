import { Logger } from "@nestjs/common";
import { bootstrapApplication } from "./app.bootstrap";
import { umzugMigrationManager } from "./_migrations/umzug-migration-manager";

(async () => {
  Logger.warn(`[${__filename}] Starting app...`);
  const app = await bootstrapApplication();
  try {
    await umzugMigrationManager.migrateUp({ app });
  } finally {
    Logger.warn(`[${__filename}] Closing app...`);
    await app.close();
    process.exit(0);
  }
})();
