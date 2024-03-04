import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";
import { domifaConfig } from "../config";

export class AutoMigration1709572023866 implements MigrationInterface {
  name = "AutoMigration1709572023866";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      appLogger.warn(
        "[MIGRATION] add false by default to interactions procuration and returnToSender"
      );
      await queryRunner.query(
        `update interactions set "procuration" = false, "returnToSender" = false where procuration is null and "returnToSender" is null;`
      );
      await queryRunner.query(
        `update interactions set "returnToSender" = false where  "returnToSender" is null;`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interactions" ALTER COLUMN "returnToSender" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ALTER COLUMN "returnToSender" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ALTER COLUMN "procuration" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ALTER COLUMN "procuration" DROP NOT NULL`
    );
  }
}
