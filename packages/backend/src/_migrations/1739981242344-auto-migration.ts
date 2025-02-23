import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1739981242344 implements MigrationInterface {
  name = "AutoMigration1739981242344";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "open_data_places" ADD "nbDomicilies" integer`
      );
      await queryRunner.query(
        `ALTER TABLE "open_data_places" ADD "nbDomiciliesDomifa" integer`
      );
      await queryRunner.query(
        `ALTER TABLE "open_data_places" ADD "nbAttestations" integer`
      );
      await queryRunner.query(
        `ALTER TABLE "open_data_places" ADD "nbAttestationsDomifa" integer`
      );
      await queryRunner.query(
        `ALTER TABLE "open_data_places" ADD "saturation" text`
      );
      await queryRunner.query(
        `ALTER TABLE "open_data_places" ADD "saturationDetails" text`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "open_data_places" DROP COLUMN "saturationDetails"`
    );
    await queryRunner.query(
      `ALTER TABLE "open_data_places" DROP COLUMN "saturation"`
    );
    await queryRunner.query(
      `ALTER TABLE "open_data_places" DROP COLUMN "nbDomiciliesDomifa"`
    );
    await queryRunner.query(
      `ALTER TABLE "open_data_places" DROP COLUMN "nbDomicilies"`
    );
  }
}
