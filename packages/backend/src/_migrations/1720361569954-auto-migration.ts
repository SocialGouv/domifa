import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1720361569954 implements MigrationInterface {
  name = "AutoMigration1720361569954";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `DROP INDEX "public"."IDX_8198a25ae40584a38bce1dd4d2"`
      );
      await queryRunner.query(
        `DROP INDEX "public"."IDX_d7abcf8875e8a94abf2dcf041e"`
      );
      await queryRunner.query(
        `DROP INDEX "public"."IDX_fef5654bcc6595d885e57d1474"`
      );
      await queryRunner.query(`DROP INDEX "public"."idx_structure_statut"`);
      await queryRunner.query(`DROP INDEX "public"."idx_usagers"`);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "idx_usagers" ON "usager" ("ref", "structureId") `
    );
    await queryRunner.query(
      `CREATE INDEX "idx_structure_statut" ON "usager" ("structureId", "decision") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fef5654bcc6595d885e57d1474" ON "usager" ("sexe") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d7abcf8875e8a94abf2dcf041e" ON "usager" ("dateNaissance") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8198a25ae40584a38bce1dd4d2" ON "usager" ("ref") `
    );
  }
}
