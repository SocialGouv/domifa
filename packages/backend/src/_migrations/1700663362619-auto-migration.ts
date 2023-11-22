import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1700663362619 implements MigrationInterface {
  name = "AutoMigration1700663362619";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_usager" ADD "acceptTerms" TIMESTAMP WITH TIME ZONE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_usager" DROP COLUMN "acceptTerms"`
    );
  }
}
