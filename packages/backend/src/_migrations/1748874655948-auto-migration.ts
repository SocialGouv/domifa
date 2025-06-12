import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1748874655948 implements MigrationInterface {
  name = "AutoMigration1748874655948";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "structure" ADD "registrationData" jsonb`
      );
      await queryRunner.query(`ALTER TABLE "structure" ADD "siret" text`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure" DROP COLUMN "registrationData"`
    );
  }
}
