import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1722521444554 implements MigrationInterface {
  name = "AutoMigration1722521444554";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "usager" ADD "nom_prenom_ref" character varying GENERATED ALWAYS AS (LOWER(nom || ' ' || prenom || ' ' || COALESCE("customRef", ''))) STORED NOT NULL;`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_3af7a33a589c062bb6151d0969" ON "usager" ("nom_prenom_ref") `
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager" DROP COLUMN "nom_prenom_ref"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ADD "nom_prenom_ref" character varying NOT NULL`
    );
  }
}
