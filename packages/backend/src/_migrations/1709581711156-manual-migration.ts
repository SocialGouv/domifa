/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";
import { domifaConfig } from "../config";

export class ManualMigration1709581711156 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      appLogger.warn(
        "[MIGRATION] add NOT NULL to interactions procuration and returnToSender"
      );
      await queryRunner.query(
        `ALTER TABLE "interactions" ALTER COLUMN "procuration" SET DEFAULT false`
      );
      await queryRunner.query(
        `ALTER TABLE "interactions" ALTER COLUMN "returnToSender" SET DEFAULT false`
      );
      await queryRunner.query(
        `ALTER TABLE "interactions" ALTER COLUMN "procuration" SET NOT NULL`
      );
      await queryRunner.query(
        `ALTER TABLE "interactions" ALTER COLUMN "returnToSender" SET NOT NULL`
      );
    }
  }
  /* eslint-disable @typescript-eslint/no-unused-vars */

  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
