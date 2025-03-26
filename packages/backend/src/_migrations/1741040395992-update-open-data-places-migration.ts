import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1741040395992 implements MigrationInterface {
  name = "AutoMigration1741040395992";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE open_data_places DROP COLUMN "uniqueId"`
    );

    await queryRunner.query(
      `DELETE FROM open_data_places where source != 'dgcs' `
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
