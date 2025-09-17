import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1757532174131 implements MigrationInterface {
  name = "AutoMigration1757532174131";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      try {
        await queryRunner.query(
          `ALTER TABLE "user_usager" DROP COLUMN "isTemporaryPassword"`
        );
        await queryRunner.query(
          `CREATE INDEX "IDX_b2ad525cbadf911e833bf61597" ON "open_data_places" ("cityCode") `
        );
      } catch (e) {
        console.log(e);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `DROP INDEX "public"."IDX_b2ad525cbadf911e833bf61597"`
      );

      await queryRunner.query(
        `ALTER TABLE "user_usager" ADD "isTemporaryPassword" boolean NOT NULL DEFAULT false`
      );
    }
  }
}
