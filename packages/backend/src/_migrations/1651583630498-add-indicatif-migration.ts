import { MigrationInterface, QueryRunner } from "typeorm";

import { domifaConfig } from "../config";

export class manualMigration1651583630498 implements MigrationInterface {
  name = "addIndicatif1651583630498";
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "structure" ADD "telephone" jsonb NOT NULL DEFAULT '{"indicatif": "fr", "numero": ""}'`
      );
      await queryRunner.query(
        `ALTER TABLE "usager" ADD "telephone" jsonb DEFAULT '{"indicatif": "fr", "numero": ""}'`
      );
      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"email": false, "phone": false, "phoneNumber": null, "telephone": {"indicatif": "fr", "numero": ""}}'`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "preference" SET DEFAULT '{"email": false, "phone": false, "phoneNumber": null}'`
    );
    await queryRunner.query(`ALTER TABLE "usager" DROP COLUMN "telephone"`);
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "telephone"`);
  }
}
