import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1704842058312 implements MigrationInterface {
  name = "AutoMigration1704842058312";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "structure" ADD "organismeType" text`
      );
      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "lastInteraction" DROP DEFAULT`
      );
      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "options" DROP DEFAULT`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "options" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" DROP COLUMN "organismeType"`
    );
  }
}
