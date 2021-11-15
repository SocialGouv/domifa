import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1636990889542 implements MigrationInterface {
  name = "addDataCustomDoc1636990889542";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure_doc" ADD "displayInPortailUsager" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure_doc" DROP COLUMN "displayInPortailUsager"`
    );
  }
}
