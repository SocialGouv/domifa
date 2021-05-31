import { bootstrapApplication, tearDownApplication } from "./app.bootstrap";
import { domifaConfig } from "./config";
import { appTypeormManager } from "./database";
import { MonitoringCleaner } from "./database/services/monitoring/MonitoringCleaner.service";
import {
  CronMailImportGuideSenderService,
  CronMailUserGuideSenderService,
} from "./mails/services";
import { messageEmailConsummerTrigger } from "./mails/services/_core";
import { CronSmsInteractionSenderService } from "./sms/services/cron-sms-interaction-sender.service";
import { appLogger } from "./util";

(async () => {
  appLogger.warn(`[${__filename}] Starting app...`);

  try {
    const { app, postgresTypeormConnection } = await bootstrapApplication();
    try {
      if (domifaConfig().typeorm.runOnStartup) {
        await appTypeormManager.migrateUp(postgresTypeormConnection);
      }
      // in local env, run cron on app startup (non blocking)
      await runCronJobs(app);
      const server = await app.listen(3000);
      server.setTimeout(1000 * 60 * 5); //  5mn - TODO @toub après refactoring de l'import, remettre le timeout par défaut
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
  if (domifaConfig().cron.emailUserGuide.autoRunOnStartup) {
    const cronMailUserGuideSenderService: CronMailUserGuideSenderService =
      app.get(CronMailUserGuideSenderService);
    await cronMailUserGuideSenderService.sendMailGuides("startup");
  }

  if (domifaConfig().cron.emailImportGuide.autoRunOnStartup) {
    const cronMailImportGuideSenderService: CronMailImportGuideSenderService =
      app.get(CronMailImportGuideSenderService);
    await cronMailImportGuideSenderService.sendMailImports("startup");
  }

  if (domifaConfig().cron.emailConsumer.autoRunOnStartup) {
    await messageEmailConsummerTrigger.triggerNextSending("startup");
  }
  if (domifaConfig().cron.monitoringCleaner.autoRunOnStartup) {
    const monitoringCleaner: MonitoringCleaner = app.get(MonitoringCleaner);
    await monitoringCleaner.purgeObsoleteData("startup");
  }
  if (domifaConfig().cron.smsConsumer.autoRunOnStartup) {
    const cronSmsInteractionSenderService = await app.get(
      CronSmsInteractionSenderService
    );
    cronSmsInteractionSenderService.sendSmsImports("startup");
  }
}
