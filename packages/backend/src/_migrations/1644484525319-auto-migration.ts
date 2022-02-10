import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class autoMigration1644484525319 implements MigrationInterface {
  name = "autoMigration1644484525319";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "prod" || domifaConfig().envId === "preprod") {
      await queryRunner.query(
        `ALTER TABLE "contact_support" RENAME COLUMN "attachement" TO "attachment"`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contact_support" RENAME COLUMN "attachment" TO "attachement"`
    );
  }
}
