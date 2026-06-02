import { MigrationInterface, QueryRunner } from "typeorm";
import {
  getUserStructureEmailStatus,
  UserStructureEmailStatus,
} from "@domifa/common";
import { domifaConfig } from "../config";
import { appLogger } from "../util";

// Sweeps every user_structure row and computes emailStatus from the email
// local part using the shared classifier. Idempotent: only rows where
// emailStatus IS NULL are touched, so reruns are no-ops.
export class BackfillUserStructureEmailStatus1780500000003
  implements MigrationInterface
{
  name = "BackfillUserStructureEmailStatus1780500000003";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId !== "prod" &&
      domifaConfig().envId !== "preprod" &&
      domifaConfig().envId !== "local"
    ) {
      return;
    }

    const rows: Array<{ id: number; email: string | null }> =
      await queryRunner.query(
        `SELECT "id", "email"
           FROM "user_structure"
          WHERE "emailStatus" IS NULL`
      );

    if (rows.length === 0) {
      appLogger.warn(
        "[backfill emailStatus] aucune ligne à mettre à jour, migration ignorée"
      );
      return;
    }

    const grouped: Record<UserStructureEmailStatus, number[]> = {
      GENERIC_CONFIRMED: [],
      GENERIC_SUSPECTED: [],
      PERSONAL: [],
    };

    for (const row of rows) {
      const status = getUserStructureEmailStatus(row.email);
      grouped[status].push(row.id);
    }

    for (const status of Object.keys(grouped) as UserStructureEmailStatus[]) {
      const ids = grouped[status];
      if (ids.length === 0) {
        continue;
      }
      await queryRunner.query(
        `UPDATE "user_structure"
            SET "emailStatus" = $1
          WHERE "id" = ANY($2::int[])`,
        [status, ids]
      );
    }

    appLogger.warn(
      `[backfill emailStatus] ${rows.length} user_structure mis à jour ` +
        `(GENERIC_CONFIRMED=${grouped.GENERIC_CONFIRMED.length}, ` +
        `GENERIC_SUSPECTED=${grouped.GENERIC_SUSPECTED.length}, ` +
        `PERSONAL=${grouped.PERSONAL.length})`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Re-run of the up() recomputes everything from scratch — the destructive
    // path is to reset the column to NULL so a re-up reprocesses every row.
    await queryRunner.query(`UPDATE "user_structure" SET "emailStatus" = NULL`);
  }
}
