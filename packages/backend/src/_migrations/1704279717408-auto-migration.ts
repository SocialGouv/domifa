import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AddFieldEntretienMigration1704279717408
  implements MigrationInterface
{
  name = "AddFieldEntretienMigration1704279717408";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "usager_entretien" ADD "situationPro" text`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager_entretien" DROP COLUMN "situationPro"`
    );
  }
}
