import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1782820564935 implements MigrationInterface {
  name = "AutoMigration1782820564935";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(`TRUNCATE TABLE "app_ip_ban"`);
      await queryRunner.query(
        `DROP INDEX IF EXISTS "public"."IDX_e558fc76d371ee63af47d7bb3c"`
      );
      await queryRunner.query(
        `ALTER TABLE "app_ip_ban" ADD "sources" jsonb NOT NULL DEFAULT '[]'::jsonb`
      );
      await queryRunner.query(
        `CREATE UNIQUE INDEX "IDX_e558fc76d371ee63af47d7bb3c" ON "app_ip_ban" ("ip") `
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_e558fc76d371ee63af47d7bb3c"`
    );
    await queryRunner.query(`ALTER TABLE "app_ip_ban" DROP COLUMN "sources"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_e558fc76d371ee63af47d7bb3c" ON "app_ip_ban" ("ip") `
    );
  }
}
