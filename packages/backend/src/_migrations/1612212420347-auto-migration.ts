import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1612212420347 implements MigrationInterface {
  name = "autoMigration1612212420347";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "app_user" ALTER COLUMN email TYPE CITEXT`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
