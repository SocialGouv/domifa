import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1656577768872 implements MigrationInterface {
  name = "autoMigration1656577768872";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "customRef" DROP NOT NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "customRef" SET NOT NULL`
    );
  }
}
