import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AddLocationMigration1695735710046 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      (domifaConfig().envId === "preprod" ||
        domifaConfig().envId === "local" ||
        domifaConfig().envId === "prod") &&
      domifaConfig().cron.enable
    ) {
      console.log(
        "\n\n\n[MIGRATION] Création de 'location' dans les structures...\n\n\n"
      );
      await queryRunner.query(
        `ALTER TABLE "structure" ADD "latitude" double precision`
      );
      await queryRunner.query(
        `ALTER TABLE "structure" ADD "longitude" double precision`
      );
    } else {
      console.log("[MIGRATION SKIPPED] Add location disabled in this env");
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "latitude"`);
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "longitude"`);
  }
}
