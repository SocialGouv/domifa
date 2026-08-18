import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AddPasswordHistory1787065723037 implements MigrationInterface {
  name = "AddPasswordHistory1787065723037";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "local" ||
      domifaConfig().envId === "preprod"
    ) {
      await queryRunner.query(
        `ALTER TABLE "user_structure_security" ADD "passwordHistory" jsonb NOT NULL DEFAULT '[]'`
      );
      await queryRunner.query(
        `ALTER TABLE "user_supervisor_security" ADD "passwordHistory" jsonb NOT NULL DEFAULT '[]'`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_supervisor_security" DROP COLUMN "passwordHistory"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" DROP COLUMN "passwordHistory"`
    );
  }
}
