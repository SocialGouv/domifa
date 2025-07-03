import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1751572909099 implements MigrationInterface {
  name = "AutoMigration1751572909099";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      // Votre migration de schéma ici
      await queryRunner.query(`
          ALTER TABLE user_structure
          ADD COLUMN "fonctionDetail" VARCHAR(255)
        `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(`
          ALTER TABLE user_structure
          DROP COLUMN "fonctionDetail"
        `);
    }
  }
}
