import { bootstrapApplication, tearDownApplication } from "./app.bootstrap";
import { appTypeormManager } from "./database";
import { appLogger } from "./util";

(async () => {
  appLogger.warn(`[${__filename}] Starting app...`);
  const { app, postgresTypeormConnection } = await bootstrapApplication();
  try {
    appLogger.warn(`[${__filename}] Starting data migration revert...`);
    await appTypeormManager.migrateDown(postgresTypeormConnection, 1);
  } catch (error) {
    appLogger.error(`[${__filename}] Error running migration`, {
      error,
      sentry: true,
    });
  } finally {
    appLogger.warn(`[${__filename}] Closing app...`);
    await tearDownApplication({ app, postgresTypeormConnection });
    process.exit(0);
  }
})();
