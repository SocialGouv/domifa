import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1717628040988 implements MigrationInterface {
  name = "AutoMigration1717628040988";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `CREATE INDEX "idx_stats_range" ON "usager_history_states" ("historyBeginDate", "historyEndDate", "isActive") `
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_stats_range"`);
  }
}
