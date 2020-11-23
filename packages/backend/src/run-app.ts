import { bootstrapApplication, tearDownApplication } from "./app.bootstrap";
import { configService } from "./config";
import { appTypeormManager } from "./database/appTypeormManager.service";
import { StatsGeneratorService } from "./stats/services/stats-generator.service";
import { appLogger } from "./util";

(async () => {
  appLogger.warn(`[${__filename}] Starting app...`);

  try {
    const { app, postgresTypeormConnection } = await bootstrapApplication();
    try {
      await appTypeormManager.migrateUp(postgresTypeormConnection);

      if (configService.getBoolean("DOMIFA_GENERATE_STATS_ON_STARTUP")) {
        // in local env, run cron on app startup (non blocking)
        appLogger.warn(`[${__filename}] Running stats generation update...`);
        await app
          .get(StatsGeneratorService)
          .generateStats()
          .then(
            () => {
              appLogger.warn(`[${__filename}] stats generation update SUCCESS`);
            },
            (error) => {
              appLogger.error(`[${__filename}] stats generation update ERROR`, {
                error,
                sentry: false,
              });
            }
          );
      }

      await app.listen(3000);
    } catch (error) {
      appLogger.error(`[${__filename}] Error running application`, {
        error,
        sentry: true,
      });
      appLogger.warn(`[${__filename}] Closing app and exit  ...`);
      await tearDownApplication({ app, postgresTypeormConnection });
      process.exit(0);
    }
  } catch (error) {
    appLogger.error(`[${__filename}] Error bootstraping application`, {
      error,
      sentry: true,
    });
    appLogger.warn(`[${__filename}] Exit`);
    process.exit(0);
  }
})();
