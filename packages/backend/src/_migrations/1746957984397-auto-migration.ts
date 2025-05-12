import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1746957984397 implements MigrationInterface {
  name = "AutoMigration1746957984397";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `CREATE TABLE "open_data_cities" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "regionCode" text   , "region" text    , "departmentCode" text    , "department" text    , "city" text NOT NULL, "cityCode" text NOT NULL, "postalCode" text, "population" integer DEFAULT '0', "areas" jsonb, CONSTRAINT "PK_f20d1eb20573a7f2922c8a5f9a8" PRIMARY KEY ("uuid"))`
      );

      await queryRunner.query(`ALTER TABLE "structure" ADD "cityCode" text`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "open_data_cities"`);
  }
}
