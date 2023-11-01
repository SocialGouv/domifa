import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1698876391788 implements MigrationInterface {
  name = "AutoMigration1698876391788";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3bc72392a39f586374f0f7d577"`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP COLUMN "previousValue"`
    );
    await queryRunner.query(`ALTER TABLE "interactions" DROP COLUMN "event"`);
    await queryRunner.query(
      `CREATE INDEX "idx_structure_statut" ON "usager" ("structureId", "decision") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_usagers" ON "usager" ("structureId", "ref") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_interactions" ON "interactions" ("structureId", "usagerUUID", "dateInteraction") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_interactions"`);
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
