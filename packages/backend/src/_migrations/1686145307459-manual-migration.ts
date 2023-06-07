import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class ManualMigration1686145307459 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log("[MIGRATION] Création des éléments encryption");
    if (
      domifaConfig().envId === "local" ||
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod"
    ) {
      await queryRunner.query(
        `ALTER TABLE "usager_docs" ADD "encryptionContext" text`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_docs" ADD "encryptionVersion" integer`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager_docs" DROP COLUMN "encryptionVersion"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_docs" DROP COLUMN "encryptionContext"`
    );
  }
}
