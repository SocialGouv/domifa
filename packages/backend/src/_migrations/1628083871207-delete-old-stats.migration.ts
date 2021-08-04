import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class deleteStatsMigration1628083871207 implements MigrationInterface {
  name = "deleteStatsMigration1628083871207";
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn("[MIGRATION] Delete old stats");
    await queryRunner.query(`DROP  TABLE IF EXISTS "structure_stats"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
