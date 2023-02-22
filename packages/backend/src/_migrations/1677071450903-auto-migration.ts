import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1677071450903 implements MigrationInterface {
  name = "autoMigration1677071450903";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager_docs" ADD "encryptionContext" text`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_docs" ADD "encryptionVersion" integer`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager_docs" DROP COLUMN "encryptionVersion"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_docs" DROP COLUMN "encryptionContext"`
    );
  }
}
