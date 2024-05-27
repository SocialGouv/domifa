import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1716819355558 implements MigrationInterface {
  name = "AutoMigration1716819355558";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `CREATE TYPE "public"."structure_stats_reporting_waitingtime_enum" AS ENUM('ONE_WEEK', 'TWO_WEEKS', 'ONE_MONTH', 'ONE_TO_SIX_MONTHS', 'MORE_THAN_SIW_MONTHS')`
      );
      await queryRunner.query(
        `CREATE TABLE "structure_stats_reporting" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "waitingList" boolean, "waitingTime" "public"."structure_stats_reporting_waitingtime_enum", "workers" integer, "volunteers" integer, "humanCosts" integer, "totalCosts" integer, "year" integer NOT NULL, "structureId" integer NOT NULL, "completedBy" jsonb, "confirmationDate" TIMESTAMP WITH TIME ZONE, CONSTRAINT "UQ_40a85c161ab5b07607f8a11ce6e" UNIQUE ("structureId", "year"), CONSTRAINT "PK_088645fe9378647c20b38ab935f" PRIMARY KEY ("uuid"))`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_e5bcedcfa5f895f9908832a959" ON "structure_stats_reporting" ("year") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_10d285ee14ee48a53c427207f9" ON "structure_stats_reporting" ("structureId") `
      );
      await queryRunner.query(
        `ALTER TABLE "structure_stats_reporting" ADD CONSTRAINT "FK_10d285ee14ee48a53c427207f98" FOREIGN KEY ("structureId") REFERENCES "structure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_10d285ee14ee48a53c427207f9"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e5bcedcfa5f895f9908832a959"`
    );
    await queryRunner.query(`DROP TABLE "structure_stats_reporting"`);
    await queryRunner.query(
      `DROP TYPE "public"."structure_stats_reporting_waitingtime_enum"`
    );
  }
}
