import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1605620815542 implements MigrationInterface {
  name = "autoMigration1605620815542";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interactions" ALTER COLUMN "dateInteraction" SET DEFAULT 'now()'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interactions" ALTER COLUMN "dateInteraction" SET DEFAULT '2020-11-16 20:40:03.011543'`
    );
  }
}
