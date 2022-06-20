import { MigrationInterface, QueryRunner } from "typeorm";

export class autoMigration1655733980535 implements MigrationInterface {
  name = "autoMigration1655733980535";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "phone" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"countryCode": "fr", "numero": ""}'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "phone" SET NOT NULL`
    );
  }
}
