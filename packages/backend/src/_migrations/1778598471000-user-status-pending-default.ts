import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class UserStatusPendingDefault1778598471000
  implements MigrationInterface
{
  name = "UserStatusPendingDefault1778598471000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "prod" || domifaConfig().envId === "local") {
      await queryRunner.query(
        `ALTER TABLE "user_structure" ALTER COLUMN "status" SET DEFAULT 'PENDING'`
      );
      await queryRunner.query(
        `ALTER TABLE "user_supervisor" ALTER COLUMN "status" SET DEFAULT 'PENDING'`
      );
      await queryRunner.query(
        `ALTER TABLE "user_usager" ALTER COLUMN "status" SET DEFAULT 'PENDING'`
      );
      // Backfill usagers that never personalized their password: they were
      // ACTIVE under the previous default but are conceptually PENDING.
      // BLOCKED / TEMPORARILY_BLOCKED rows are left untouched.
      await queryRunner.query(
        `UPDATE "user_usager" SET "status" = 'PENDING' WHERE "status" = 'ACTIVE' AND "passwordType" <> 'PERSONAL'`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "user_usager" SET "status" = 'ACTIVE' WHERE "status" = 'PENDING'`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'`
    );
    await queryRunner.query(
      `ALTER TABLE "user_supervisor" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'`
    );
  }
}
