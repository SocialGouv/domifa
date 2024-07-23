import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class IndexStatutMigration1721725997794 implements MigrationInterface {
  name = "IndexStatutMigration1721725997794";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(`UPDATE usager SET statut = decision->>'statut'`);
      await queryRunner.query(
        `CREATE INDEX "idx_usager_statut" ON "usager" ("structureId", "statut") `
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_usager_statut"`);
  }
}
