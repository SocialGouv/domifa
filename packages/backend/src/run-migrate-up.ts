import { bootstrapApplication, tearDownApplication } from "./app.bootstrap";
import { appTypeormManager } from "./database/appTypeormManager.service";
import { appLogger } from "./util";

(async () => {
  appLogger.warn(`[${__filename}] Starting app...`);
  const { app, postgresTypeormConnection } = await bootstrapApplication();
  try {
    appLogger.warn(`[${__filename}] Starting data migration...`);
    await appTypeormManager.migrateUp(postgresTypeormConnection);
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
