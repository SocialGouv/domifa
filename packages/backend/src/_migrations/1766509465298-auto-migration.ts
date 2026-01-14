import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1766509465298 implements MigrationInterface {
  name = "AutoMigration1766509465298";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "local" ||
      domifaConfig().envId === "preprod"
    ) {
      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "typeDom" SET NOT NULL`
      );

      await queryRunner.query(
        `ALTER TABLE "usager_history_states" ALTER COLUMN "typeDom" SET NOT NULL`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "local" ||
      domifaConfig().envId === "preprod"
    ) {
      await queryRunner.query(
        `ALTER TABLE "usager_history_states" ALTER COLUMN "typeDom" DROP NOT NULL`
      );
      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "typeDom" DROP NOT NULL`
      );
    }
  }
}
