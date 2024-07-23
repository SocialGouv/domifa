import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class CreateStatutMigration1721725635589 implements MigrationInterface {
  name = "CreateStatutMigration1721725635589";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "usager" ADD "statut" text DEFAULT 'INSTRUCTION' NOT NULL`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "usager" DROP COLUMN "statut"`);
  }
}
