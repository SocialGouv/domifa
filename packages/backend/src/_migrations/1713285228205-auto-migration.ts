import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1713285228205 implements MigrationInterface {
  name = "AutoMigration1713285228205";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "test"
    ) {
      return;
    }

    await queryRunner.query(`ALTER TABLE "usager" ADD "nationalite" text`);
    await queryRunner.query(
      `ALTER TABLE "usager_history_states" ADD "nationalite" text`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" ALTER COLUMN "telephone" DROP DEFAULT`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_history_states" ADD "sexe" text`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_history_states" ADD "dateNaissance" TIMESTAMP WITH TIME ZONE`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "options" DROP DEFAULT`
    );
    await queryRunner.query(`ALTER TABLE "usager" DROP COLUMN "nationalite"`);
    await queryRunner.query(
      `ALTER TABLE "usager_history_states" DROP COLUMN "dateNaissance"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager_history_states" DROP COLUMN "sexe"`
    );
  }
}
