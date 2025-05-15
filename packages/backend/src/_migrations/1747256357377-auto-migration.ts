import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1747256357377 implements MigrationInterface {
  name = "AutoMigration1747256357377";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "structure_doc" ADD "encryptionContext" text`
      );
      await queryRunner.query(
        `ALTER TABLE "structure_doc" ADD "encryptionVersion" integer`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure_doc" DROP COLUMN "encryptionVersion"`
    );
    await queryRunner.query(
      `ALTER TABLE "structure_doc" DROP COLUMN "encryptionContext"`
    );
  }
}
