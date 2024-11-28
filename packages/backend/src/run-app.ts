import "./open-telemetry";
import { bootstrapApplication, tearDownApplication } from "./app.bootstrap";

import { appLogger } from "./util";

(async () => {
  appLogger.warn(`[${__filename}] Starting app...`);

  try {
    const { app, postgresTypeormConnection } = await bootstrapApplication();
    try {
      // in local env, run cron on app startup (non blocking)
      const server = await app.listen(3000);
      server.setTimeout(1000 * 60 * 5);
      appLogger.warn(`[${__filename}] Application listening on port 3000`);
    } catch (error) {
      const err = error as Error;
      appLogger.error(`[${__filename}] Error running application`, {
        error: err,
        sentry: true,
      });
      appLogger.warn(`[${__filename}] Closing app and exit  ...`);
      await tearDownApplication({ app, postgresTypeormConnection });
      process.exit(0);
    }
  } catch (error) {
    const err = error as Error;

    appLogger.error(`[${__filename}] Error bootstraping application`, {
      error: err,
      sentry: true,
    });
    appLogger.warn(`[${__filename}] Exit`);
    process.exit(0);
  }
})();
