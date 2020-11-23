import { bootstrapApplication, tearDownApplication } from "./app.bootstrap";
import { dataAnonymizer } from "./database";
import { appLogger } from "./util";

(async () => {
  appLogger.warn(`[${__filename}] Starting app...`);
  const { app, postgresTypeormConnection } = await bootstrapApplication();
  try {
    appLogger.warn(`[${__filename}] Starting data anonymization...`);
    await dataAnonymizer.anonymize(app);
  } catch (error) {
    appLogger.error(`[${__filename}] Error anonymizing data`, {
      error,
      sentry: true,
    });
  } finally {
    appLogger.warn(`[${__filename}] Closing app...`);
    await tearDownApplication({ app, postgresTypeormConnection });
    process.exit(0);
  }
})();
