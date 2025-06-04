import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1749052121748 implements MigrationInterface {
  name = "AutoMigration1749052121748";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "structure" ADD "domicilieSegment" text`
      );
      await queryRunner.query(
        `ALTER TABLE "structure" ADD "populationSegment" text`
      );
      await queryRunner.query(
        `ALTER TABLE "open_data_places" ADD "cityCode" text`
      );
      await queryRunner.query(
        `ALTER TABLE "open_data_places" ADD "populationSegment" text`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "options" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "open_data_places" DROP COLUMN "populationSegment"`
    );
    await queryRunner.query(
      `ALTER TABLE "open_data_places" DROP COLUMN "cityCode"`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" DROP COLUMN "populationSegment"`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" DROP COLUMN "domicilieSegment"`
    );
  }
}
