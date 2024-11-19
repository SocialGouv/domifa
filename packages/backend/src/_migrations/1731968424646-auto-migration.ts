import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1731968424646 implements MigrationInterface {
  name = "AutoMigration1731968424646";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "contact_support" DROP COLUMN "status"`
      );
      await queryRunner.query(
        `ALTER TABLE "contact_support" DROP COLUMN "category"`
      );
      await queryRunner.query(
        `ALTER TABLE "contact_support" DROP COLUMN "comments"`
      );
      await queryRunner.query(
        `ALTER TABLE "contact_support" ADD "subject" text`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "options" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_support" DROP COLUMN "subject"`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_support" ADD "comments" text`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_support" ADD "category" text`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_support" ADD "status" text NOT NULL DEFAULT 'ON_HOLD'`
    );
  }
}
