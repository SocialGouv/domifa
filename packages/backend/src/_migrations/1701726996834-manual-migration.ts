import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class ManualMigration1701726996834 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn("[MIGRATION] Update procuration");

    const count = await queryRunner.query(
      `SELECT count(uuid) from interactions where LOWER(content) LIKE '%courrier remis au mandataire%'`
    );

    console.log(count);
    await queryRunner.query(
      `UPDATE interactions SET "procuration" = true WHERE LOWER(content) LIKE '%courrier remis au mandataire%';`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
