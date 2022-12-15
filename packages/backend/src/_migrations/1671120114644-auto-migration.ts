import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1671120114644 implements MigrationInterface {
  name = "autoMigration1671120114644";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "usager" DROP COLUMN "oldNotes"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" ADD "oldNotes" jsonb NOT NULL DEFAULT '[]'`
    );
  }
}
