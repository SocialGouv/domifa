import { MigrationInterface, QueryRunner } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { UsagerAyantDroit } from "@domifa/common";
import { domifaConfig } from "../config";
import { appLogger } from "../util";

// Backfill a stable `uuid` on every ayant droit stored in `usager.ayantsDroits`.
// Only ayants droit that don't already have one are touched, so the migration is
// replayable (a second run updates nothing). Dev/test databases get their data
// from the dumps, which already carry the uuids, so we skip them here.
//
// Simple load / mutate in JS / patch back, one usager at a time: each row is its
// own UPDATE, so one bad row can't take the whole backfill down with it — it's
// logged and counted, the rest keeps going, and the MEP output ends with real
// numbers (found / updated / failed) instead of a single opaque result.
export class AddUuidToAyantsDroits1789048027887 implements MigrationInterface {
  name = "AddUuidToAyantsDroits1789048027887";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const env = domifaConfig().envId;
    if (env !== "prod" && env !== "preprod" && env !== "local") {
      appLogger.warn(
        `[backfill ayantsDroits uuid] ignorée: env "${env}" (prod/preprod/local uniquement)`
      );
      return;
    }

    const rows: { uuid: string; ayantsDroits: UsagerAyantDroit[] }[] =
      await queryRunner.query(
        `SELECT uuid, "ayantsDroits"
           FROM usager
          WHERE jsonb_typeof("ayantsDroits") = 'array'
            AND EXISTS (
              SELECT 1 FROM jsonb_array_elements("ayantsDroits") AS elem
              WHERE elem->>'uuid' IS NULL
            )`
      );

    appLogger.warn(
      `[backfill ayantsDroits uuid] ${rows.length} usagers à mettre à jour`
    );

    let updated = 0;
    let failed = 0;

    for (const row of rows) {
      try {
        const ayantsDroits = row.ayantsDroits.map((ayantDroit) =>
          ayantDroit?.uuid ? ayantDroit : { ...ayantDroit, uuid: uuidv4() }
        );

        await queryRunner.query(
          `UPDATE usager SET "ayantsDroits" = $1 WHERE uuid = $2`,
          [JSON.stringify(ayantsDroits), row.uuid]
        );

        updated++;
      } catch (error) {
        failed++;
        appLogger.error(
          `[backfill ayantsDroits uuid] échec sur l'usager ${row.uuid}`,
          { error, sentry: true, context: { usagerUUID: row.uuid } }
        );
      }
    }

    appLogger.warn(
      `[backfill ayantsDroits uuid] terminé — ${rows.length} trouvés, ${updated} mis à jour, ${failed} échecs`
    );
  }

  public async down(): Promise<void> {
    // `uuid` is now required on AyantDroit: nothing to revert.
  }
}
