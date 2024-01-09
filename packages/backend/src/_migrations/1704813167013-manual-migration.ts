/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";

export class ManualMigration1704813167013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`update usager_history set migrated = false`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
