import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1670972783703 implements MigrationInterface {
  name = "autoMigration1670972783703";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "usager" set migrated = false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "usager" set migrated = true`);
  }
}
