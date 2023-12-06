import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1701901668716 implements MigrationInterface {
  name = "AutoMigration1701901668716";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "options" SET DEFAULT '{"numeroBoite": true, "surnom": false}'`
    );
    await queryRunner.query(
      `UPDATE "structure" SET options = jsonb_set(options, '{surnom}', 'false', true)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
  }
}
