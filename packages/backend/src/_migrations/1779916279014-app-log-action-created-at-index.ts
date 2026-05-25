import { MigrationInterface, QueryRunner } from "typeorm";

// Composite index supporting the super-admin "Suspicious activity" listing,
// which filters `app_log` by `action IN (...)` and orders by `createdAt DESC`.
// Without it, the query degrades to a sequential scan on the full table once
// app_log grows past a few million rows.
export class AppLogActionCreatedAtIndex1779916279014
  implements MigrationInterface
{
  name = "AppLogActionCreatedAtIndex1779916279014";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_app_log_action_created_at"
       ON "app_log" ("action", "createdAt" DESC)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_app_log_action_created_at"`
    );
  }
}
