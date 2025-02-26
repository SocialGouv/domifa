import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1739981242345 implements MigrationInterface {
  name = "AutoMigration1739981242345";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "open_data_places" ADD "dgcsId" text`
      );
      await queryRunner.query(
        `ALTER TABLE "open_data_places" ADD "reseau" text`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "open_data_places" DROP COLUMN "dgcsId"`
    );
    await queryRunner.query(
      `ALTER TABLE "open_data_places" DROP COLUMN "reseau"`
    );
  }
}
