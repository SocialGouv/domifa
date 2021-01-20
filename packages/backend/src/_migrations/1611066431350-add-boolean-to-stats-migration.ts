import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1611066431350 implements MigrationInterface {
  name = "autoMigration1611066431350";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure_stats" ADD "generated" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure_stats" DROP COLUMN "generated"`
    );
  }
}
