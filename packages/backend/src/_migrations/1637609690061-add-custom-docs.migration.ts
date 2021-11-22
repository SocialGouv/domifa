import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1637609690061 implements MigrationInterface {
  name = "adCustomDocMigration1637609690061";

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
