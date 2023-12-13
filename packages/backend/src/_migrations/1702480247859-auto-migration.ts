import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1702480247859 implements MigrationInterface {
  name = "AutoMigration1702480247859";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "open_data_places" ADD "mail" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "open_data_places" DROP COLUMN "mail"`
    );
  }
}
