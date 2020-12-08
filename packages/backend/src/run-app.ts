import { bootstrapApplication, tearDownApplication } from "./app.bootstrap";
import { domifaConfig } from "./config";
import { appTypeormManager } from "./database";
import { CronMailImportGuideSenderService } from "./mails/services/cron-mail-import-guide-sender.service";
import { CronMailUserGuideSenderService } from "./mails/services/cron-mail-user-guide-sender.service";
import { MessageEmailConsummer } from "./mails/services/message-email-consumer.service";
import { StatsGeneratorService } from "./stats/services/stats-generator.service";
import { appLogger } from "./util";

(async () => {
  appLogger.warn(`[${__filename}] Starting app...`);

  try {
    const { app, postgresTypeormConnection } = await bootstrapApplication();
    try {
      await appTypeormManager.migrateUp(postgresTypeormConnection);

      // in local env, run cron on app startup (non blocking)
      await runCronJobs(app);
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
  if (domifaConfig().cron.stats.autoRunOnStartup) {
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
  if (domifaConfig().cron.emailUserGuide.autoRunOnStartup) {
    const cronMailUserGuideSenderService: CronMailUserGuideSenderService = app.get(
      CronMailUserGuideSenderService
    );
    await cronMailUserGuideSenderService.sendMailGuides("startup");
  }

  if (domifaConfig().cron.emailImportGuide.autoRunOnStartup) {
    const cronMailImportGuideSenderService: CronMailImportGuideSenderService = app.get(
      CronMailImportGuideSenderService
    );
    await cronMailImportGuideSenderService.sendMailImports("startup");
  }

  if (domifaConfig().cron.emailConsumer.autoRunOnStartup) {
    const messageEmailConsummer: MessageEmailConsummer = app.get(
      MessageEmailConsummer
    );
    await messageEmailConsummer.triggerNextSending("startup");
  }
}
