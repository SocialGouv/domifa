import { MigrationInterface, QueryRunner } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { UsagerAyantDroit } from "@domifa/common";
import { appLogger } from "../util";

/**
 * Backfill a stable `uuid` on every ayant droit stored in `usager.ayantsDroits`.
 *
 * - only touches ayants droit that don't already have a `uuid` (replayable: a
 *   second run selects nothing and writes nothing)
 * - processes usagers in batches, each batch in its own transaction
 *   (migrationsTransactionMode is "none")
 * - scope is the `usager` table only, `usager_history_states` is left untouched
 */
export class AddUuidToAyantsDroits1789048027887 implements MigrationInterface {
  name = "AddUuidToAyantsDroits1789048027887";

  private readonly BATCH_SIZE = 500;

  public async up(queryRunner: QueryRunner): Promise<void> {
    let totalUpdated = 0;

    appLogger.warn("[ayantsDroits-uuid] start backfill");

    for (;;) {
      const rows: { uuid: string; ayantsDroits: UsagerAyantDroit[] }[] =
        await queryRunner.query(
          `SELECT uuid, "ayantsDroits"
             FROM usager
            WHERE jsonb_typeof("ayantsDroits") = 'array'
              AND EXISTS (
                SELECT 1
                  FROM jsonb_array_elements("ayantsDroits") AS elem
                 WHERE elem->>'uuid' IS NULL
              )
            LIMIT $1`,
          [this.BATCH_SIZE]
        );

      if (rows.length === 0) {
        break;
      }

      await queryRunner.startTransaction();
      try {
        for (const row of rows) {
          const ayantsDroits = (row.ayantsDroits ?? []).map((ayantDroit) =>
            ayantDroit?.uuid ? ayantDroit : { ...ayantDroit, uuid: uuidv4() }
          );

          await queryRunner.query(
            `UPDATE usager SET "ayantsDroits" = $1 WHERE uuid = $2`,
            [JSON.stringify(ayantsDroits), row.uuid]
          );
        }
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      }

      totalUpdated += rows.length;
      appLogger.warn(`[ayantsDroits-uuid] ${totalUpdated} usagers updated`);
    }

    appLogger.warn(
      `[ayantsDroits-uuid] done — ${totalUpdated} usagers updated in total`
    );
  }

  public async down(): Promise<void> {
    // No down: `uuid` is now a required field on AyantDroit, removing the ids
    // would break the contract. Nothing to revert.
  }
}
