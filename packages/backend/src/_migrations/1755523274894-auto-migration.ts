import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1755523274894 implements MigrationInterface {
  name = "AutoMigration1755523274894";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "dev" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "user_usager" ADD "passwordType" text NOT NULL DEFAULT true`
      );

      await queryRunner.query(
        `  ALTER TABLE "user_usager"  DROP COLUMN "enabled" `
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_usager" DROP COLUMN "passwordType"`
    );
  }
}
