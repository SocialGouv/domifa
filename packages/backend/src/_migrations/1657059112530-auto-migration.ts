import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class preparePhoneMigration1657059112530 implements MigrationInterface {
  name = "preparePhoneMigration1657059112530";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"countryCode": "fr", "numero": ""}'`
      );
      await queryRunner.query(
        `ALTER TABLE "usager" ADD "contactByPhone" boolean DEFAULT false`
      );

      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "telephone" SET DEFAULT '{"countryCode": "fr", "numero": ""}'`
      );
      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "preference" DROP DEFAULT`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"phone": false, "telephone": {"numero": "", "countryCode": "fr"}}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "telephone" SET DEFAULT '{"numero": "", "countryCode": "fr"}'`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" DROP COLUMN "contactByPhone"`
    );
  }
}
