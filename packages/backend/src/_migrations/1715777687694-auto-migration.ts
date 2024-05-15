import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config/domifaConfig.service";

export class AutoMigration1715777687694 implements MigrationInterface {
  name = "AutoMigration1715777687694";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "user_structure" ADD "territories" text`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure" ADD "userRightStatus" text NOT NULL DEFAULT 'structure'`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP COLUMN "userRightStatus"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP COLUMN "territories"`
    );
  }
}
