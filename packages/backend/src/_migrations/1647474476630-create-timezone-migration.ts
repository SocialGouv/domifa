/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { appLogger } from "../util";

export class createTimeZoneMigration1647474476630
  implements MigrationInterface
{
  name = "createTimeZoneMigration1647474476630";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      appLogger.warn("[MIGRATION] Création de la timezone");
      await queryRunner.query(`ALTER TABLE "structure" ADD "timeZone" text`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn("[MIGRATION] Suppression de la timezone");
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "timeZone"`);
  }
}
