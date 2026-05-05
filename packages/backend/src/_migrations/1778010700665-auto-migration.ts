import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1778010700665 implements MigrationInterface {
  name = "AutoMigration1778010700665";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (domifaConfig().envId === "prod" || domifaConfig().envId === "preprod") {
      await queryRunner.query(
        `ALTER TABLE "structure" ADD "reseauDetail" text`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure" DROP COLUMN "reseauDetail"`
    );
  }
}
