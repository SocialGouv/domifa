import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1701870413794 implements MigrationInterface {
  name = "AutoMigration1701870413794";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "lastInteraction" DROP DEFAULT`
      );
      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "options" DROP DEFAULT`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_b3d70227bb45dd8060e256ee33" ON "interactions" ("procuration") `
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b3d70227bb45dd8060e256ee33"`
    );
  }
}
