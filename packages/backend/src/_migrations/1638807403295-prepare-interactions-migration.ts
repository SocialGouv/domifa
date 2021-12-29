import { appLogger } from "./../util/AppLogger.service";
import { MigrationInterface, QueryRunner } from "typeorm";

export class manualMigration1638807403295 implements MigrationInterface {
  name = "prepareInteractionMigration1635801057529";
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(
      "[MIGRATION] prepareInteractionMigration1635801057529 start"
    );

    appLogger.debug("[MIGRATION] Création de interactionsMigrated ");

    await queryRunner.query(
      `ALTER TABLE "usager" ADD "interactionsMigrated" boolean NOT NULL DEFAULT false`
    );

    await queryRunner.query(
      `ALTER TABLE "interactions" ADD "interactionOutUUID" uuid`
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_495b59d0dd15e43b262f2da890" ON "interactions" ("interactionOutUUID") `
    );

    await queryRunner.query(
      `ALTER TABLE "interactions" ADD CONSTRAINT "FK_495b59d0dd15e43b262f2da8907" FOREIGN KEY ("interactionOutUUID") REFERENCES "interactions"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );

    appLogger.debug("[MIGRATION] Initialisation de interactionsMigrated");
    await queryRunner.query(
      `UPDATE "usager" SET "interactionsMigrated" = false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP CONSTRAINT "FK_495b59d0dd15e43b262f2da8907"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_495b59d0dd15e43b262f2da890"`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP COLUMN "interactionOutUUID"`
    );
    await queryRunner.query(
      `ALTER TABLE "usager" DROP COLUMN "interactionsMigrated"`
    );
  }
}
