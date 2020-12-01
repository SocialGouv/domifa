import { bootstrapApplication, tearDownApplication } from "./app.bootstrap";
import { domifaConfig } from "./config";
import { appTypeormManager } from "./database";
import { CronMailsService } from "./mails/services/cron-mails.service";
import { StatsGeneratorService } from "./stats/services/stats-generator.service";
import { appLogger } from "./util";

(async () => {
  appLogger.warn(`[${__filename}] Starting app...`);

  try {
    const { app, postgresTypeormConnection } = await bootstrapApplication();
    try {
      await appTypeormManager.migrateUp(postgresTypeormConnection);

      if (domifaConfig().cron.autoRunOnStartup) {
        // in local env, run cron on app startup (non blocking)
        await runCronJobs(app);
      }
      await app.listen(3000);
      appLogger.warn(`[${__filename}] Application listening on port 3000`);
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
async function runCronJobs(app) {
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
  appLogger.warn(`[${__filename}] Running cronGuide mail service...`);
  await app
    .get(CronMailsService)
    .cronGuide()
    .then(
      () => {
        appLogger.warn(`[${__filename}] cronGuide mail service SUCCESS`);
      },
      (error) => {
        appLogger.error(`[${__filename}] cronGuide mail service ERROR`, {
          error,
          sentry: false,
        });
      }
    );
  appLogger.warn(`[${__filename}] Running cronImport mail service...`);
  await app
    .get(CronMailsService)
    .cronImport()
    .then(
      () => {
        appLogger.warn(`[${__filename}] cronImport mail service SUCCESS`);
      },
      (error) => {
        appLogger.error(`[${__filename}] cronImport mail service ERROR`, {
          error,
          sentry: false,
        });
      }
    );
}

