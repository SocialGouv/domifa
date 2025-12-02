import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { userStructureRepository } from "../../../database";
import { appLogsRepository } from "../../../database/services/app-log";
import { BrevoSenderService } from "./brevo-sender/brevo-sender.service";

@Injectable()
export class BrevoSyncCronService {
  private readonly logger = new Logger(BrevoSyncCronService.name);
  private readonly BATCH_SIZE = 250;

  constructor(private readonly brevoSenderService: BrevoSenderService) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async syncUsersToBrevo(): Promise<void> {
    const startTime = Date.now();
    this.logger.log("Démarrage de la synchronisation Brevo");

    try {
      const users = await userStructureRepository.getAllUsersForSync();

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < users.length; i += this.BATCH_SIZE) {
        const batch = users.slice(i, i + this.BATCH_SIZE);
        const batchNumber = Math.floor(i / this.BATCH_SIZE) + 1;

        try {
          for (const user of batch) {
            try {
              await this.brevoSenderService.syncContactToBrevo(user);
              successCount++;
            } catch (userError) {
              errorCount++;
              this.logger.warn(
                `Erreur lors de la synchronisation de l'utilisateur ${user.id}`,
                userError
              );
            }
          }

          this.logger.log(
            `Batch ${batchNumber}: ${batch.length} contacts traités`
          );
        } catch (error) {
          errorCount += batch.length;
          this.logger.error(
            `Erreur lors du traitement du batch ${batchNumber}`,
            error
          );
        }

        if (i + this.BATCH_SIZE < users.length) {
          await this.sleep(500);
        }
      }

      const duration = Date.now() - startTime;

      await appLogsRepository.save(
        appLogsRepository.create({
          action: "BREVO_SYNC",
          context: {
            totalUsers: users.length,
            successCount,
            errorCount,
            durationMs: duration,
          },
        })
      );

      this.logger.log(
        `Synchronisation terminée: ${successCount} succès, ${errorCount} erreurs en ${duration}ms`
      );
    } catch (error) {
      this.logger.error(
        "Erreur fatale lors de la synchronisation Brevo",
        error
      );

      await appLogsRepository.save(
        appLogsRepository.create({
          action: "BREVO_SYNC",
          context: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        })
      );

      throw error;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
