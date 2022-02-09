import { appLogger } from "../util/AppLogger.service";
import { MigrationInterface, QueryRunner } from "typeorm";

export class fixPortailAccessMigration1644364708862
  implements MigrationInterface
{
  name = "fixPortailAccessMigration1644364708862";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(
      "[MIGRATION] Mise à jour des portail-usagers, activés par défaut"
    );
    await queryRunner.query(
      `UPDATE structure set "portailUsager" = '{"enabledByDomifa": true, "enabledByStructure": false}' WHERE "portailUsager" ='{"enabledByDomifa": false, "enabledByStructure": false}'::jsonb`
    );
    appLogger.debug(
      "[MIGRATION] Ajout d'une colonne pour le formulaire contact"
    );
    await queryRunner.query(
      `ALTER TABLE "contact_support" ADD "structureName" text `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP CONSTRAINT "FK_495b59d0dd15e43b262f2da8907"`
    );
  }
}
