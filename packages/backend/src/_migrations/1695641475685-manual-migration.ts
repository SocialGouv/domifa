/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";

export class ManualMigration1695641475685 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log("MIGRATION - mise en minuscule de l'email");
    await queryRunner.query(`UPDATE user_structure SET email = LOWER(email)`);
    await queryRunner.query(`UPDATE structure SET email = LOWER(email)`);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
