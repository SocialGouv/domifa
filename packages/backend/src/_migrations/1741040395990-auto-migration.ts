import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1741040395990 implements MigrationInterface {
  name = "AutoMigration1741040395990";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      await queryRunner.query(`ALTER TABLE "structure" ADD "reseau" text`);
      await queryRunner.query(
        `ALTER TABLE "structure" ALTER COLUMN "codePostal" SET NOT NULL`
      );
      await queryRunner.query(
        `ALTER TABLE "structure" ALTER COLUMN "ville" SET NOT NULL`
      );
      await queryRunner.query(
        `ALTER TABLE "structure" ALTER COLUMN "timeZone" SET NOT NULL`
      );
      await queryRunner.query(
        `UPDATE "usager_docs" set "shared"= false where shared is null`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_docs" ALTER COLUMN "shared" SET NOT NULL`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_docs" ALTER COLUMN "shared" SET DEFAULT false`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "usager_history_states" DROP CONSTRAINT "FK_85ac9012f78c974fb73a5352dfe"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_history_states" DROP CONSTRAINT "FK_e819c8b113a23a4a0c13a741da0"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_docs" ALTER COLUMN "shared" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_docs" ALTER COLUMN "shared" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "structure_stats_reporting" DROP COLUMN "waitingTime"`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "timeZone" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "ville" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "codePostal" DROP NOT NULL`
    );
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "reseau"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_62204f14a6d17cad41d419d150" ON "structure" ("codePostal") `
    );
  }
}
