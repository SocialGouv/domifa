import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class ManualMigration1686145351265 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log("[MIGRATION] Suppression de 'tags' dans 'structure_doc'");
    if (
      domifaConfig().envId === "local" ||
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod"
    ) {
      await queryRunner.query(`ALTER TABLE "structure_doc" DROP COLUMN "tags"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "structure_doc" ADD "tags" jsonb`);
  }
}
