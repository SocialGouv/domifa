/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class ManualMigration1748870856745 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(`
        UPDATE "open_data_cities"
        SET "populationSegment" = CASE
            WHEN "population" < 10000 THEN '< 10 000 habitants'
            WHEN "population" >= 10000 AND "population" <= 49999 THEN 'Entre 10 000 et 49 999 habitants'
            WHEN "population" >= 50000 AND "population" <= 99999 THEN 'Entre 50 000 et 99 999 habitants'
            WHEN "population" >= 100000 THEN '≥ 100 000 habitants'
            ELSE NULL
        END
        WHERE "population" IS NOT NULL
    `);

      await queryRunner.query(`
        UPDATE "open_data_places"
        SET "domicilieSegment" = CASE
            WHEN "nbDomiciliesDomifa" < 10 THEN '< 10 domiciliés'
            WHEN "nbDomiciliesDomifa" >= 10 AND "nbDomiciliesDomifa" <= 499 THEN 'Entre 10 et 499 domiciliés'
            WHEN "nbDomiciliesDomifa" >= 500 AND "nbDomiciliesDomifa" <= 1999 THEN 'Entre 500 et 1999 domiciliés'
            WHEN "nbDomiciliesDomifa" >= 2000 THEN '≥ 2000 domiciliés'
            ELSE NULL
        END
        WHERE "nbDomiciliesDomifa" IS NOT NULL
    `);
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
