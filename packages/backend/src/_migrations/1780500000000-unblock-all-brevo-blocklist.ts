/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";
import { TransactionalEmailsApi } from "@getbrevo/brevo";
import { domifaConfig } from "../config";
import { appLogSecurityRepository, AppLogSecurityTable } from "../database";
import { appLogger } from "../util";

// Empties Brevo's SMTP transactional blocklist (the list shown on the
// /brevo-blocklist admin page: hard bounces, spam complaints, manual ops
// blocks). Equivalent to clicking "Débloquer" on every row, in one shot.
//
// Skipped when Brevo calls are mocked (test / local / emails disabled), so
// re-running locally is a no-op.
//
// Irreversible: down() is a no-op — re-blocking contacts is not desirable.
export class UnblockAllBrevoBlocklist1780500000000
  implements MigrationInterface
{
  name = "UnblockAllBrevoBlocklist1780500000000";

  public async up(_queryRunner: QueryRunner): Promise<void> {
    const config = domifaConfig();

    if (
      !config.email.emailsEnabled ||
      config.envId === "test" ||
      config.envId === "local"
    ) {
      appLogger.warn("[EMAILS DISABLED] Migration de déblocage Brevo ignorée");
      return;
    }

    const api = new TransactionalEmailsApi();
    api.setApiKey(0, config.brevo.apiKey);

    const PAGE_SIZE = 100;
    // Always read offset=0: every successful delete shrinks the server-side
    // list, so the next "first page" naturally exposes the next batch.
    // MAX_ITERATIONS bounds the loop in case the API misbehaves.
    const MAX_ITERATIONS = 2000;

    let unblocked = 0;
    let failed = 0;

    for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
      const { body } = await api.getTransacBlockedContacts(
        undefined,
        undefined,
        PAGE_SIZE,
        0,
        undefined,
        "desc"
      );
      const contacts = (
        body as unknown as { contacts?: Array<{ email?: string }> }
      ).contacts;

      if (!contacts || contacts.length === 0) {
        break;
      }

      let pageProgressed = false;

      for (const contact of contacts) {
        const email = contact.email;
        if (!email) {
          continue;
        }
        try {
          await api.smtpBlockedContactsEmailDelete(email);
          unblocked++;
          pageProgressed = true;
          await writeUnblockAuditLog(email);
        } catch (error: any) {
          const status =
            error?.response?.statusCode ??
            error?.response?.status ??
            error?.status;
          if (status === 404) {
            // Already absent — count as success and move on.
            unblocked++;
            pageProgressed = true;
            await writeUnblockAuditLog(email);
            continue;
          }
          failed++;
          appLogger.warn(
            `Échec déblocage Brevo pour ${email} (status=${status})`
          );
        }
      }

      // Guard against re-reading the same head page forever if every row on
      // it kept failing (e.g. persistent API error on those specific emails).
      if (!pageProgressed) {
        break;
      }
    }

    appLogger.warn(
      `Migration déblocage Brevo terminée: ${unblocked} contacts débloqués, ${failed} échecs`
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // No-op: re-blocking contacts on Brevo is not desirable.
  }
}

// Best-effort: the unblock has already succeeded on Brevo's side, so a
// failure to persist the audit row must not abort the migration.
async function writeUnblockAuditLog(email: string): Promise<void> {
  try {
    await appLogSecurityRepository.save(
      new AppLogSecurityTable({
        userType: "system",
        action: "UNBLOCK_BREVO_CONTACT",
        context: {
          email,
          kind: "transactional",
          source: "migration-unblock-all-brevo-blocklist",
        },
      })
    );
  } catch (error: any) {
    appLogger.warn(
      `Échec écriture audit log déblocage Brevo pour ${email}: ${
        error?.message ?? error
      }`
    );
  }
}
