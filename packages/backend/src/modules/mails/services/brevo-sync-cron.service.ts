import { Injectable } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { SentryCron } from "@sentry/nestjs";
import { userStructureRepository, appLogsRepository } from "../../../database";
import { BrevoSenderService } from "./brevo-sender/brevo-sender.service";
import { isCronEnabled } from "../../../config/services/isCronEnabled.service";
import { domifaConfig } from "../../../config";
import { appLogger } from "../../../util";
import { SYSTEM_ACTOR_FIELDS } from "../../app-logs/app-logs.helpers";
import { BrevoEmailEvent, BrevoEmailEventType } from "@domifa/common";
import {
  EmailDeliveryIssueReason,
  getEmailDeliveryIssues,
  getPreferredSenderDomains,
} from "./brevo-sync-cron.helpers";
import { BrevoSenderDomain } from "./brevo-sender/brevo-senders.const";

const DELIVERY_ISSUE_DAYS = 90;
const EVENTS_PAGE_SIZE = 2500;
const BLOCKLIST_PAGE_SIZE = 100;

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

  @Cron(CronExpression.EVERY_DAY_AT_10PM, {
    timeZone: "Europe/Paris",
    disabled: !isCronEnabled() || domifaConfig().envId !== "prod",
  })
  @SentryCron("brevo-email-delivery-issue-cron", {
    schedule: {
      type: "crontab",
      value: CronExpression.EVERY_DAY_AT_10PM,
    },
    timezone: "Europe/Paris",
    checkinMargin: 10,
    maxRuntime: 30,
  })
  async syncEmailDeliveryIssues(): Promise<{
    issues: Map<string, EmailDeliveryIssueReason>;
    preferredSenders: Map<string, BrevoSenderDomain>;
  }> {
    const delivered = await this.fetchEvents("delivered");
    const opened = await this.fetchEvents("opened");
    const softBounces = await this.fetchEvents("softBounces");
    const hardBounces = await this.fetchEvents("hardBounces");
    const blocked = await this.fetchEvents("blocked");
    const blocklisted = await this.fetchBlocklistedEmails();

    const emailsOf = (events: BrevoEmailEvent[]) =>
      events.map((event) => event.email);
    const issues = getEmailDeliveryIssues({
      delivered: emailsOf(delivered),
      opened: emailsOf(opened),
      failed: emailsOf([...softBounces, ...hardBounces, ...blocked]),
      blocklisted,
    });
    const preferredSenders = getPreferredSenderDomains({ delivered, opened });

    const emails = [...issues.keys()];
    const recipientDomains = [...preferredSenders.keys()];
    const senders = [...preferredSenders.values()];

    for (const table of ["user_structure", "user_supervisor"]) {
      await userStructureRepository.query(
        `UPDATE "${table}" SET "emailDeliveryIssue" = (lower("email") = ANY($1::text[]))
        WHERE "emailDeliveryIssue" IS DISTINCT FROM (lower("email") = ANY($1::text[]))`,
        [emails]
      );
      await userStructureRepository.query(
        `WITH preferred AS (
          SELECT u."id", p.sender
          FROM "${table}" u
          LEFT JOIN unnest($1::text[], $2::text[]) AS p(domain, sender)
            ON p.domain = split_part(lower(u."email"), '@', 2)
        )
        UPDATE "${table}" t SET "preferredEmailSender" = preferred.sender
        FROM preferred
        WHERE preferred."id" = t."id"
          AND t."preferredEmailSender" IS DISTINCT FROM preferred.sender`,
        [recipientDomains, senders]
      );
    }

    appLogger.info(
      `[BREVO DELIVERY ISSUE] ${emails.length} adresses en souffrance, ${recipientDomains.length} domaines avec un expéditeur préféré, sur ${DELIVERY_ISSUE_DAYS}j`
    );
    return { issues, preferredSenders };
  }

  private async fetchEvents(
    event: BrevoEmailEventType
  ): Promise<BrevoEmailEvent[]> {
    const events: BrevoEmailEvent[] = [];
    const maxOffset = EVENTS_PAGE_SIZE * 200;
    for (let offset = 0; offset < maxOffset; offset += EVENTS_PAGE_SIZE) {
      const page = await this.brevoSenderService.getEmailEventsForEmail({
        event,
        days: DELIVERY_ISSUE_DAYS,
        limit: EVENTS_PAGE_SIZE,
        offset,
      });
      events.push(...page);
      if (page.length < EVENTS_PAGE_SIZE) {
        return events;
      }
    }
    appLogger.warn(
      `[BREVO DELIVERY ISSUE] Pagination ${event} tronquée à ${maxOffset} événements`
    );
    return events;
  }

  private async fetchBlocklistedEmails(): Promise<string[]> {
    const emails: string[] = [];
    for (let offset = 0; ; offset += BLOCKLIST_PAGE_SIZE) {
      const page =
        await this.brevoSenderService.listTransactionalBlockedContacts(
          offset,
          BLOCKLIST_PAGE_SIZE
        );
      emails.push(...page.map((contact) => contact.email));
      if (page.length < BLOCKLIST_PAGE_SIZE) {
        return emails;
      }
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
    if (domifaConfig().envId !== "prod") {
      return { success: 0, error: 0 };
    }

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
        ...SYSTEM_ACTOR_FIELDS,
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
        ...SYSTEM_ACTOR_FIELDS,
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
