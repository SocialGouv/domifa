import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { appLogger } from "../util";

export class AutoMigration1744739736819 implements MigrationInterface {
  name = "AutoMigration1744739736819";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      appLogger.info("MIGRATION - Add new fields in app_log");
      await queryRunner.query(`ALTER TABLE "app_log" ADD "role" text`);
      await queryRunner.query(`ALTER TABLE "app_log" ADD "createdBy" text`);
      await queryRunner.query(
        `ALTER TABLE "app_log" ALTER COLUMN "structureId" DROP NOT NULL`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "app_log" ALTER COLUMN "structureId" SET NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "app_log" DROP COLUMN "createdBy"`);
    await queryRunner.query(`ALTER TABLE "app_log" DROP COLUMN "role"`);
  }
}
