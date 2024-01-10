/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";

export class ManualMigration1704925438407 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `update usager set migrated = false where decision->>'statut' = 'VALIDE' `
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
