import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";
import { userStructureRepository } from "../../../database";
import { appLogsRepository } from "../../../database/services/app-log";
import { BrevoSenderService } from "./brevo-sender/brevo-sender.service";
import { isCronEnabled } from "../../../config/services/isCronEnabled.service";
import { domifaConfig } from "../../../config";
import { appLogger } from "../../../util";

@Injectable()
export class BrevoSyncCronService {
  private readonly BATCH_SIZE = 250;
  private readonly DELAY_BETWEEN_BATCHES = 500;

  constructor(private readonly brevoSenderService: BrevoSenderService) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    timeZone: "Europe/Paris",
    disabled: !isCronEnabled() || domifaConfig().envId !== "prod",
  })
  @SentryCron("brevo-sync-cron", {
    schedule: {
      type: "crontab",
      value: CronExpression.EVERY_DAY_AT_1AM,
    },
    timezone: "Europe/Paris",
    checkinMargin: 10,
    maxRuntime: 60,
  })
  async syncUsersToBrevo(): Promise<void> {
    const startTime = Date.now();
    appLogger.info("Démarrage de la synchronisation Brevo");

    try {
      const users = await userStructureRepository.getAllUsersForSync();

      if (users.length === 0) {
        appLogger.info("Aucun utilisateur à synchroniser");
        return;
      }

      const results = await this.processBatches(users);
      const duration = Date.now() - startTime;

      await this.logResults(results, users.length, duration);
      appLogger.info(
        `Synchronisation terminée: ${results.success} succès, ${results.error} erreurs en ${duration}ms`
      );
    } catch (error) {
      await this.logError(error);
      throw error;
    }
  }

  private async processBatches(
    users: any[]
  ): Promise<{ success: number; error: number }> {
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < users.length; i += this.BATCH_SIZE) {
      const batch = users.slice(i, i + this.BATCH_SIZE);
      const batchNumber = Math.floor(i / this.BATCH_SIZE) + 1;

      const batchResults = await this.processBatch(batch);
      successCount += batchResults.success;
      errorCount += batchResults.error;

      appLogger.info(
        `Batch ${batchNumber}: ${batchResults.success} succès, ${batchResults.error} erreurs`
      );

      // Délai avant le prochain batch
      if (i + this.BATCH_SIZE < users.length) {
        await this.sleep(this.DELAY_BETWEEN_BATCHES);
      }
    }

    return { success: successCount, error: errorCount };
  }

  private async processBatch(
    batch: any[]
  ): Promise<{ success: number; error: number }> {
    let success = 0;
    let error = 0;

    for (const user of batch) {
      try {
        await this.brevoSenderService.syncContactToBrevo(user);
        success++;
      } catch (userError) {
        error++;
        appLogger.warn(
          `Erreur synchronisation utilisateur ${user.id}`,
          userError
        );
      }
    }

    return { success, error };
  }

  private async logResults(
    results: { success: number; error: number },
    totalUsers: number,
    durationMs: number
  ): Promise<void> {
    await appLogsRepository.save(
      appLogsRepository.create({
        action: "BREVO_SYNC",
        context: {
          totalUsers,
          successCount: results.success,
          errorCount: results.error,
          durationMs,
        },
      })
    );
  }

  private async logError(error: unknown): Promise<void> {
    appLogger.error("Erreur fatale lors de la synchronisation Brevo", error);

    await appLogsRepository.save(
      appLogsRepository.create({
        action: "BREVO_SYNC",
        context: {
          error: error instanceof Error ? error.message : "Unknown error",
        },
      })
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
