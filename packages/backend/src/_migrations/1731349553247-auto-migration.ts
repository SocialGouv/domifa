import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1731349553247 implements MigrationInterface {
  name = "AutoMigration1731349553247";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "usager" DROP COLUMN "nom_prenom_ref"`
      );
      await queryRunner.query(
        `ALTER TABLE "usager" ADD "nom_prenom_surnom_ref" character varying NULL`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_57133463f2311234ecf27157fa" ON "usager" ("nom_prenom_surnom_ref") `
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_57133463f2311234ecf27157fa"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" DROP COLUMN "nom_prenom_surnom_ref"`
    );
  }
}
