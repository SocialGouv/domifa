import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1637088042910 implements MigrationInterface {
  name = "addDatasToCustomDocs1637088042910";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure_doc" ADD "customDocType" text`
    );
    await queryRunner.query(
      `ALTER TABLE "structure_doc" ADD "displayInPortailUsager" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure_doc" DROP COLUMN "displayInPortailUsager"`
    );
    await queryRunner.query(
      `ALTER TABLE "structure_doc" DROP COLUMN "customDocType"`
    );
  }
}
