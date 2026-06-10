import { ContactsApi } from "@getbrevo/brevo";
import { MigrationInterface, QueryRunner } from "typeorm";

import { domifaConfig } from "../config";

// One-shot cleanup: structures in REFUS / SUPPRIME still occupy their
// `structure.email` (and any orphan `user_structure.email`) on the UNIQUE
// constraint, which blocks people from re-registering with that address.
//
// What this migration does, per affected structure:
//   1. Best-effort: delete the original email from Brevo (Contacts API) so the
//      contact stops receiving marketing/transactional volume routed at it.
//   2. UPDATE structure.email -> "deleted-<original>" (idempotent: WHERE NOT
//      LIKE 'deleted-%').
//   3. UPDATE user_structure.email -> "deleted-<original>" for the few rows
//      that may have survived the deleteStructureData cascade (rare; legacy).
//
// Brevo errors are swallowed and logged so a transient API issue does not
// block the SQL prefix. Re-running is safe: prefixed rows are filtered out
// and Brevo 404 is treated as success. See `isDeletedEmail` in
// brevo-sender.service for the runtime guard that prevents these addresses
// from ever being re-synced to Brevo.

const DELETED_PREFIX = "deleted-";
const TARGET_STATUTS = ["REFUS", "SUPPRIME"];

interface StructureRow {
  id: number;
  email: string;
}

interface UserStructureRow {
  id: number;
  email: string;
}

export class PrefixDeletedEmailsForRemovedStructures1781108400000
  implements MigrationInterface
{
  name = "PrefixDeletedEmailsForRemovedStructures1781108400000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const brevo = buildBrevoClient();

    const structures: StructureRow[] = await queryRunner.query(
      `SELECT id, email
         FROM structure
        WHERE statut = ANY($1::text[])
          AND email NOT LIKE $2`,
      [TARGET_STATUTS, `${DELETED_PREFIX}%`]
    );

    console.info(
      `[migration ${this.name}] ${
        structures.length
      } structure(s) à nettoyer (statuts=${TARGET_STATUTS.join("/")})`
    );

    for (const structure of structures) {
      const orphanUsers: UserStructureRow[] = await queryRunner.query(
        `SELECT id, email
           FROM user_structure
          WHERE "structureId" = $1
            AND email NOT LIKE $2`,
        [structure.id, `${DELETED_PREFIX}%`]
      );

      if (brevo) {
        await deleteBrevoContact(brevo, structure.email);
        for (const user of orphanUsers) {
          await deleteBrevoContact(brevo, user.email);
        }
      }

      await queryRunner.query(
        `UPDATE structure
            SET email = $1 || email
          WHERE id = $2
            AND email NOT LIKE $3`,
        [DELETED_PREFIX, structure.id, `${DELETED_PREFIX}%`]
      );

      if (orphanUsers.length > 0) {
        await queryRunner.query(
          `UPDATE user_structure
              SET email = $1 || email
            WHERE "structureId" = $2
              AND email NOT LIKE $3`,
          [DELETED_PREFIX, structure.id, `${DELETED_PREFIX}%`]
        );
      }
    }

    console.info(`[migration ${this.name}] terminé`);
  }

  // Strips the "deleted-" prefix back out. Brevo contacts are NOT restored —
  // the API offers no undelete primitive. If you really need them back, sync
  // happens naturally on the next user login / structure update.
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE structure
          SET email = SUBSTRING(email FROM ${DELETED_PREFIX.length + 1})
        WHERE statut = ANY($1::text[])
          AND email LIKE $2`,
      [TARGET_STATUTS, `${DELETED_PREFIX}%`]
    );

    await queryRunner.query(
      `UPDATE user_structure
          SET email = SUBSTRING(email FROM ${DELETED_PREFIX.length + 1})
        WHERE email LIKE $1
          AND "structureId" IN (
            SELECT id FROM structure WHERE statut = ANY($2::text[])
          )`,
      [`${DELETED_PREFIX}%`, TARGET_STATUTS]
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
