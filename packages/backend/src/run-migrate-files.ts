import { bootstrapApplication, tearDownApplication } from "./app.bootstrap";
import { migrateOldFiles } from "./usagers/utils";
import { appLogger } from "./util";

(async () => {
  appLogger.warn(`[${__filename}] Starting app...`);
  const { app, postgresTypeormConnection } = await bootstrapApplication();
  try {
    appLogger.warn(`[${__filename}] Starting migration of old files ...`);
    await migrateOldFiles();
  } catch (error) {
    appLogger.error(`[${__filename}] Error running migration old files`, {
      error,
      sentry: true,
    });
  } finally {
    appLogger.warn(`[${__filename}] Closing app...`);
    await tearDownApplication({ app, postgresTypeormConnection });
    process.exit(0);
  }
})();
