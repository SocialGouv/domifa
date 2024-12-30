import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1735574440877 implements MigrationInterface {
  name = "AutoMigration1735574440877";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `DROP INDEX "public"."IDX_57133463f2311234ecf27157fa"`
      );
      await queryRunner.query(
        `ALTER TABLE "structure" DROP COLUMN "filesUpdated"`
      );
      await queryRunner.query(`ALTER TABLE "contact_support" ADD "phone" text`);
      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "nom_prenom_surnom_ref" SET NOT NULL`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_f072e2874bd87ecb6da2fbd66e" ON "usager" ("nom_prenom_surnom_ref") `
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f072e2874bd87ecb6da2fbd66e"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "nom_prenom_surnom_ref" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "contact_support" DROP COLUMN "phone"`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ADD "filesUpdated" boolean NOT NULL DEFAULT false`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_57133463f2311234ecf27157fa" ON "usager" ("nom_prenom_surnom_ref") `
    );
  }
}
