import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class ManualMigration1713903515915 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.info("[MIGRATION] Suppression des stats de dossiers inexistants");

    await queryRunner.query(`
      DELETE FROM usager_history_states
      WHERE NOT EXISTS (
        SELECT 1
        FROM usager
        WHERE usager_history_states."usagerUUID" = usager.uuid );
    `);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
