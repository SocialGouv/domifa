import { domifaConfig } from "./../config/domifaConfig.service";
import { MigrationInterface, QueryRunner } from "typeorm";

export class createTsaMigration1663080156555 implements MigrationInterface {
  name = "createTsaMigration1663080156555";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "usager" ADD "numeroDistribution" text`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" DROP COLUMN "numeroDistribution"`
    );
  }
}
