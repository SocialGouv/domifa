import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class autoMigration1673907997370 implements MigrationInterface {
  name = "autoMigration1673907997370";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "dev" || domifaConfig().envId === "test") {
      return;
    }
    await queryRunner.query(
      `ALTER TABLE "structure" ADD "acceptTerms" TIMESTAMP WITH TIME ZONE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure" DROP COLUMN "acceptTerms"`
    );
  }
}
