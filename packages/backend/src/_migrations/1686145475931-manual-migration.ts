import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class ManualMigration1686145475931 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log("[MIGRATION] Ajout d'une variable de migration");

    if (
      domifaConfig().envId === "local" ||
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod"
    ) {
      try {
        await queryRunner.query(
          `ALTER TABLE "structure" ADD "filesUpdated" boolean NOT NULL DEFAULT false`
        );
      } catch (e) {
        console.log("Column filesUpdated already exists");
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure" DROP COLUMN "mifilesUpdatedgrated"`
    );
  }
}
