import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class autoMigration1641289401387 implements MigrationInterface {
  name = "autoMigration1641289401387";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "prod" || domifaConfig().envId === "preprod") {
      await queryRunner.query(
        `ALTER TABLE "usager" DROP COLUMN "interactionsMigrated"`
      );
      await queryRunner.query(
        `ALTER TABLE "interactions" ALTER COLUMN "nbCourrier" SET DEFAULT '0'`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interactions" ALTER COLUMN "nbCourrier" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ADD "interactionsMigrated" boolean NOT NULL DEFAULT false`
    );
  }
}
