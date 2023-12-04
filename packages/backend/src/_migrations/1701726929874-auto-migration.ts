import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { appLogger } from "../util";

export class AutoMigration1701726929874 implements MigrationInterface {
  name = "AutoMigration1701726929874";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn("[MIGRATION] Create procuration");
    if (
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "interactions" ADD "procuration" boolean`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP COLUMN "procuration"`
    );
  }
}
