/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class ManualMigration1718704909039 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(`
      ALTER TABLE structure_stats_reporting
      ALTER COLUMN "workers" TYPE numeric(10, 2),
      ALTER COLUMN "volunteers" TYPE numeric(10, 2),
      ALTER COLUMN "humanCosts" TYPE numeric(10, 2),
      ALTER COLUMN "totalCosts" TYPE numeric(10, 2);
      `);
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
