import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1780932874467 implements MigrationInterface {
  name = "AutoMigration1780932874467";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "user_supervisor" ADD "decision" jsonb`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure" ADD "decision" jsonb`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP COLUMN "decision"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_supervisor" DROP COLUMN "decision"`
    );
  }
}
