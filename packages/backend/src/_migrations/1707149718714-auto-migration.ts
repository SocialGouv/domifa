import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1707149718714 implements MigrationInterface {
  name = "AutoMigration1707149718714";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(
        `ALTER TABLE "usager_entretien" ADD "situationProDetail" text`
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_bf49c177bbacd36423531ecc07" ON "structure" ("departmentName") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_2877f8c3f6cbddc785bf938d0a" ON "structure" ("regionName") `
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2877f8c3f6cbddc785bf938d0a"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_bf49c177bbacd36423531ecc07"`
    );

    await queryRunner.query(
      `ALTER TABLE "usager_entretien" DROP COLUMN "situationProDetail"`
    );
  }
}
