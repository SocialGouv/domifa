import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1721817064651 implements MigrationInterface {
  name = "AutoMigration1721817064651";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `DROP  INDEX IF EXISTS "public"."IDX_9643302335674f651c0e867235"`
      );
      await queryRunner.query(
        `DROP  INDEX IF EXISTS "public"."IDX_2877f8c3f6cbddc785bf938d0a"`
      );
      await queryRunner.query(
        `DROP  INDEX IF EXISTS "public"."IDX_bf49c177bbacd36423531ecc07"`
      );
      await queryRunner.query(
        `DROP  INDEX IF EXISTS "public"."IDX_c2fa002e6f45fe1ca6c7f23496"`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `CREATE INDEX "IDX_c2fa002e6f45fe1ca6c7f23496" ON "usager_options_history" ("userId") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_bf49c177bbacd36423531ecc07" ON "structure" ("departmentName") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_2877f8c3f6cbddc785bf938d0a" ON "structure" ("regionName") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_9643302335674f651c0e867235" ON "app_log" ("userId") `
      );
    }
  }
}
