import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class manualMigration1630956510605 implements MigrationInterface {
  name = "fixEnableSmsMigration1630956510605";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn("[MIGRATION] Fix Enabled SMS Data");

    queryRunner.query(
      `update structure set sms =sms || '{"enabledByDomifa": true}'::jsonb where sms->>'enabledByDomifa' is null`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
