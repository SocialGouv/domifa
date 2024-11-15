import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1731347018702 implements MigrationInterface {
  name = "AutoMigration1731347018702";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `CREATE TABLE typeorm_metadata ( type varchar(255), schema varchar(255), name varchar(255), value text );`
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
    await queryRunner.query(
      `ALTER TABLE "usager" ADD "nom_prenom_surnom_ref" character varying NOT NULL`
    );
  }
}
