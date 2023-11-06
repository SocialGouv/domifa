import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";
import { domifaConfig } from "../config";

export class OptimizeInteractionsMigration1698876391788
  implements MigrationInterface
{
  name = "OptimizeInteractionsMigration1698876391788";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "dev") {
      appLogger.info("[MIGRATION] Skipped");
      return;
    }

    appLogger.info("[MIGRATION] Delete deleted interactions");
    await queryRunner.query(`DELETE from interactions where event = 'delete'`);

    appLogger.info("[MIGRATION] DROP columns previousValue & event");
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP COLUMN "previousValue"`
    );
    await queryRunner.query(`ALTER TABLE "interactions" DROP COLUMN "event"`);

    appLogger.info("[MIGRATION] Create new indexes");
    await queryRunner.query(
      `CREATE INDEX "idx_structure_statut" ON "usager" ("structureId", "decision") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_usagers" ON "usager" ("structureId", "ref") `
    );

    appLogger.info("[MIGRATION] DROP useless indexes");
    await queryRunner.query(
      `DROP INDEX "public"."IDX_0c5d7e9585c77ff002d4072c3c"`
    );

    await queryRunner.query(
      `ALTER TABLE "interactions" DROP CONSTRAINT "FK_495b59d0dd15e43b262f2da8907"`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_usagers"`);
    await queryRunner.query(`DROP INDEX "public"."idx_structure_statut"`);
    await queryRunner.query(
      `ALTER TABLE "interactions" ADD "event" text NOT NULL DEFAULT 'create'`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ADD "previousValue" jsonb`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3bc72392a39f586374f0f7d577" ON "interactions" ("event") `
    );
  }
}
