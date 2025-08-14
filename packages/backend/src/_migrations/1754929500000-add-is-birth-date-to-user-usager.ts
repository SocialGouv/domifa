import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AddIsBirthDateToUserUsager1754929500000
  implements MigrationInterface
{
  name = "AddIsBirthDateToUserUsager1754929500000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "dev" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `  ALTER TABLE "user_usager"  ADD COLUMN "isBirthDate" boolean NOT NULL DEFAULT false`
      );

      await queryRunner.query(
        `  ALTER TABLE "user_usager"  DROP COLUMN "enabled" `
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_usager"
      DROP COLUMN "isBirthDate"
    `);
  }
}
