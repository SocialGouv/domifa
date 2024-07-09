import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1720558050667 implements MigrationInterface {
  name = "AutoMigration1720558050667";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `CREATE INDEX "IDX_c72d39c3d5bf0192fa5a2470d9" ON "expired_token" ("token") `
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_c72d39c3d5bf0192fa5a2470d9"`
    );
  }
}
