import { MigrationInterface, QueryRunner } from "typeorm";
import { usagerRepository } from "../database";
import { appLogger } from "../util";

export class ManualMigration1696941100775 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const condition = `("options"->'npai'->>'actif')::boolean is false and decision->>'statut' = 'RADIE' and "structureId" = 201 and decision->>'dateDebut'  < '2023-06-01'`;
    const before: number = await usagerRepository
      .createQueryBuilder("usager")
      .select("COUNT(uuid)")
      .where(condition)
      .getCount();

    appLogger.info(
      "[MIGRATION] Mise à jour des 'NPAI' pour les radiés de Bordeaux ..."
    );
    appLogger.info("Avant la migration: " + before);

    await queryRunner.query(
      `UPDATE usager SET "options" = jsonb_set("options", '{npai,actif}', 'true', false) WHERE ("options"->'npai'->>'actif')::boolean is false  AND decision->>'statut' = 'RADIE'  AND "structureId" = 201  AND decision->>'dateDebut' < '2023-06-01'`
    );

    const after: number = await usagerRepository
      .createQueryBuilder("usager")
      .select("COUNT(uuid)")
      .where(condition)
      .getCount();

    appLogger.info("Après la migration: " + after);
    appLogger.info(
      "[MIGRATION] Mise à jour des 'NPAI' pour les radiés de Bordeaux ✅"
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
