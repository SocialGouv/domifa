import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1753607421699 implements MigrationInterface {
  name = "AutoMigration1753607421699";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(`ALTER TABLE "app_log" ADD "context" json`);
      await queryRunner.query(
        `ALTER TABLE "app_log" ALTER COLUMN "userId" DROP NOT NULL`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "app_log" ALTER COLUMN "userId" SET NOT NULL`
      );
      await queryRunner.query(`ALTER TABLE "app_log" DROP COLUMN "context"`);
    }
  }
}
