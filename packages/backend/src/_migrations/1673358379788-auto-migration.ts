import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1673358379788 implements MigrationInterface {
  name = "autoMigration1673358379788";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD "acceptTerms" TIMESTAMP WITH TIME ZONE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP COLUMN "acceptTerms"`
    );
  }
}
