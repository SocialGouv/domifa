import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { appLogger } from "../util";

// Legacy user_structure accounts created before `passwordLastUpdate` was set
// at signup (see user-structure-creator.service.ts) never got the column
// filled in. For accounts that have already logged in, the app already
// treats `createdAt` as the password's birth date as a fallback
// (see getPasswordChangeStatus / display-password-age.component.ts) — this
// backfills the column itself so raw SQL/reporting sees the same value.
// Idempotent: only rows where passwordLastUpdate IS NULL are touched.
export class BackfillUserStructurePasswordLastUpdate1786366757476
  implements MigrationInterface
{
  name = "BackfillUserStructurePasswordLastUpdate1786366757476";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId !== "prod" &&
      domifaConfig().envId !== "preprod" &&
      domifaConfig().envId !== "local"
    ) {
      return;
    }

    const countToBackfill = async (): Promise<number> => {
      const [{ count }] = await queryRunner.query(
        `SELECT count(*) AS count
           FROM "user_structure"
          WHERE "passwordLastUpdate" IS NULL
            AND "lastLogin" IS NOT NULL`
      );
      return Number(count);
    };

    const beforeCount = await countToBackfill();
    appLogger.warn(
      `[backfill passwordLastUpdate] ${beforeCount} user_structure à mettre à jour`
    );

    const result = await queryRunner.query(
      `UPDATE "user_structure"
          SET "passwordLastUpdate" = "createdAt"
        WHERE "passwordLastUpdate" IS NULL
          AND "lastLogin" IS NOT NULL`
    );

    const afterCount = await countToBackfill();
    appLogger.warn(
      `[backfill passwordLastUpdate] ${
        result?.[1] ?? 0
      } user_structure mis à jour (passwordLastUpdate = createdAt) — ${afterCount} restantes (attendu: 0)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "user_structure"
          SET "passwordLastUpdate" = NULL
        WHERE "passwordLastUpdate" = "createdAt"
          AND "lastLogin" IS NOT NULL`
    );
  }
}
