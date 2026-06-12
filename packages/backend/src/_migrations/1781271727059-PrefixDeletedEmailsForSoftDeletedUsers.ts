import { ContactsApi } from "@getbrevo/brevo";
import { MigrationInterface, QueryRunner } from "typeorm";

import { domifaConfig } from "../config";

// One-shot cleanup for individual user soft-deletes (user_structure /
// user_supervisor with status = "DELETE") whose email was not prefixed.
// The earlier 1781108400000 migration only covered users orphaned from a
// SUPPRIME / REFUS structure; this one closes the gap for users deleted
// directly via the admin UI before the runtime prefix landed.
//
// Per affected row:
//   1. Best-effort: delete the original email from Brevo so the contact stops
//      receiving any traffic.
//   2. UPDATE email -> "deleted-DDMMYYYY-<original>" (idempotent: WHERE NOT
//      LIKE 'deleted-%'). DDMMYYYY = migration day, matching the runtime
//      softDelete format (date-fns "ddMMyyyy").
//
// Brevo errors are swallowed: a transient API issue must not block the SQL
// prefix. Re-running is safe — prefixed rows are filtered out and a 404 on
// the Brevo delete is treated as success.

const DELETED_PREFIX = "deleted-";

interface UserRow {
  id: number;
  email: string;
}

export class PrefixDeletedEmailsForSoftDeletedUsers1781271727059
  implements MigrationInterface
{
  name = "PrefixDeletedEmailsForSoftDeletedUsers1781271727059";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const brevo = buildBrevoClient();

    await this.prefixTable(
      queryRunner,
      brevo,
      "user_structure",
      "[user_structure]"
    );
    await this.prefixTable(
      queryRunner,
      brevo,
      "user_supervisor",
      "[user_supervisor]"
    );

    console.info(`[migration ${this.name}] terminé`);
  }

  // Strips the "deleted-DDMMYYYY-" prefix back out. Brevo contacts are NOT
  // restored — the API offers no undelete primitive.
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE user_structure
          SET email = regexp_replace(email, '^deleted-[0-9]{8}-', '')
        WHERE status = 'DELETE'
          AND email ~ '^deleted-[0-9]{8}-'`
    );
    await queryRunner.query(
      `UPDATE user_supervisor
          SET email = regexp_replace(email, '^deleted-[0-9]{8}-', '')
        WHERE status = 'DELETE'
          AND email ~ '^deleted-[0-9]{8}-'`
    );
  }

  private async prefixTable(
    queryRunner: QueryRunner,
    brevo: ContactsApi | null,
    table: "user_structure" | "user_supervisor",
    logTag: string
  ): Promise<void> {
    const rows: UserRow[] = await queryRunner.query(
      `SELECT id, email
         FROM ${table}
        WHERE status = 'DELETE'
          AND email NOT LIKE $1`,
      [`${DELETED_PREFIX}%`]
    );

    console.info(
      `[migration ${this.name}] ${logTag} ${rows.length} ligne(s) à préfixer`
    );

    if (rows.length === 0) {
      return;
    }

    if (brevo) {
      for (const row of rows) {
        await deleteBrevoContact(brevo, row.email);
      }
    }

    await queryRunner.query(
      `UPDATE ${table}
          SET email = $1 || to_char(now(), 'DDMMYYYY') || '-' || email
        WHERE status = 'DELETE'
          AND email NOT LIKE $2`,
      [DELETED_PREFIX, `${DELETED_PREFIX}%`]
    );
  }
}

function buildBrevoClient(): ContactsApi | null {
  const config = domifaConfig();
  if (
    !config.email.emailsEnabled ||
    config.envId === "test" ||
    config.envId === "local"
  ) {
    console.info(
      `[migration] envId=${config.envId} / emailsEnabled=${config.email.emailsEnabled} → suppression Brevo ignorée`
    );
    return null;
  }
  if (!config.brevo.apiKey) {
    console.warn(`[migration] DOMIFA_MAIL_BREVO_API_KEY absent → Brevo ignoré`);
    return null;
  }
  const api = new ContactsApi();
  // Same auth pattern as BrevoSenderService — the typed setter doesn't exist
  // on ContactsApi so we reach into the auth bag directly.
  (
    api as unknown as {
      authentications: { apiKey: { apiKey: string } };
    }
  ).authentications.apiKey.apiKey = config.brevo.apiKey;
  return api;
}

async function deleteBrevoContact(
  api: ContactsApi,
  email: string
): Promise<void> {
  try {
    await api.deleteContact(email);
    console.info(`[migration] Brevo contact supprimé : ${email}`);
  } catch (error: unknown) {
    const err = error as {
      response?: { statusCode?: number; status?: number };
      status?: number;
      message?: string;
    };
    const status =
      err?.response?.statusCode ?? err?.response?.status ?? err?.status;
    if (status === 404) {
      console.info(
        `[migration] Brevo contact absent (déjà supprimé) : ${email}`
      );
      return;
    }
    console.warn(
      `[migration] Échec suppression Brevo ${email} (status=${status}) : ${
        err?.message ?? String(error)
      }`
    );
  }
}
