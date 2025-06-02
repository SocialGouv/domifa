/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class ManualMigration1748870856744 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "open_data_cities" ADD "populationSegment" text`
      );
      await queryRunner.query(
        `ALTER TABLE "open_data_places" ADD "domicilieSegment" text`
      );
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
