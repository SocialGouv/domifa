import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class createLogMigration1640108810708 implements MigrationInterface {
  name = "createLogMigration1640108810708";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "prod" || domifaConfig().envId === "preprod") {
      await queryRunner.query(
        `CREATE TABLE "log" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "userId" integer NOT NULL, "usagerRef" integer, "structureId" integer NOT NULL, "action" text NOT NULL, CONSTRAINT "PK_69f8faf72fa4038748e4e3f3fbe" PRIMARY KEY ("uuid"))`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "log"`);
  }
}
