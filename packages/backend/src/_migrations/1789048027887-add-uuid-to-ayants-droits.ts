import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { appLogger } from "../util";

// Backfill a stable `uuid` on every ayant droit stored in `usager.ayantsDroits`.
// Only ayants droit that don't already have one are touched, so the migration is
// replayable (a second run updates nothing). Dev/test databases get their data
// from the dumps, which already carry the uuids, so we skip them here.
//
// Done as a single server-side UPDATE, not a SELECT-into-JS-then-write-back:
// each row's new `ayantsDroits` is computed from that same row's current value
// as part of the UPDATE itself (Postgres takes the row lock for the statement),
// so a concurrent PATCH /usagers/:ref landing while this runs can't be silently
// reverted — there's no read/modify/write window for it to land in.
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

    const [{ count }]: { count: string }[] = await queryRunner.query(
      `SELECT count(*) AS count
         FROM usager
        WHERE jsonb_typeof("ayantsDroits") = 'array'
          AND EXISTS (
            SELECT 1 FROM jsonb_array_elements("ayantsDroits") AS elem
            WHERE elem->>'uuid' IS NULL
          )`
    );
    appLogger.warn(
      `[backfill ayantsDroits uuid] ${count} usagers à mettre à jour`
    );

    await queryRunner.query(
      `UPDATE usager
          SET "ayantsDroits" = (
            SELECT jsonb_agg(
                     CASE
                       WHEN elem->>'uuid' IS NOT NULL THEN elem
                       ELSE elem || jsonb_build_object('uuid', gen_random_uuid())
                     END
                     ORDER BY ord
                   )
              FROM jsonb_array_elements("ayantsDroits") WITH ORDINALITY t(elem, ord)
          )
        WHERE jsonb_typeof("ayantsDroits") = 'array'
          AND EXISTS (
            SELECT 1 FROM jsonb_array_elements("ayantsDroits") AS elem
            WHERE elem->>'uuid' IS NULL
          )`
    );

    appLogger.warn("[backfill ayantsDroits uuid] terminé");
  }

  public async down(): Promise<void> {
    // `uuid` is now required on AyantDroit: nothing to revert.
  }
}
