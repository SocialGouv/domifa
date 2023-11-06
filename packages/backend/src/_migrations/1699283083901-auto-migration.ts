import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { appLogger } from "../util";

export class AutoMigration1699283083901 implements MigrationInterface {
  name = "AutoMigration1699283083901";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "dev") {
      appLogger.info("[MIGRATION] Skipped");
      return;
    }
    await queryRunner.query(
      `CREATE INDEX "idx_interactions_type" ON "interactions" ("structureId", "usagerUUID", "type") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_interactions_date" ON "interactions" ("structureId", "usagerUUID", "dateInteraction") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_interactions_date"`);
    await queryRunner.query(`DROP INDEX "public"."idx_interactions_type"`);
  }
}
