/* eslint-disable @typescript-eslint/no-unused-vars */
import { MigrationInterface, QueryRunner } from "typeorm";

import { appLogger } from "../util";

export class ManualMigration1749052121751 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn("[MIGRATION] Début du calcul des segments");

    appLogger.warn(
      "[MIGRATION] Calcul du domicilieSegment pour les structures"
    );

    await queryRunner.query(`
      UPDATE structure
      SET "domicilieSegment" = segments.segment
      FROM (
        SELECT
          s.uuid,
          CASE
            WHEN COALESCE(domicilie_count, 0) < 10 THEN 'VERY_SMALL'
            WHEN COALESCE(domicilie_count, 0) BETWEEN 10 AND 499 THEN 'SMALL'
            WHEN COALESCE(domicilie_count, 0) BETWEEN 500 AND 1999 THEN 'MEDIUM'
            WHEN COALESCE(domicilie_count, 0) >= 2000 THEN 'LARGE'
          END as segment
        FROM structure s
        LEFT JOIN (
          SELECT
            "structureId",
            COUNT(DISTINCT uuid) as domicilie_count
          FROM usager
          WHERE statut = 'VALIDE'
          GROUP BY "structureId"
        ) u ON s.id = u."structureId"
      ) as segments
      WHERE structure.uuid = segments.uuid
    `);

    // 2. Calculer populationSegment pour les structures à partir d'open_data_cities via cityCode
    appLogger.warn(
      "[MIGRATION] Calcul du populationSegment pour les structures"
    );

    await queryRunner.query(`
      UPDATE structure
      SET "populationSegment" = CASE
        WHEN odc.population < 10000 THEN 'SMALL'
        WHEN odc.population BETWEEN 10000 AND 49999 THEN 'MEDIUM'
        WHEN odc.population BETWEEN 50000 AND 99999 THEN 'LARGE'
        WHEN odc.population >= 100000 THEN 'VERY_LARGE'
      END
      FROM open_data_cities odc
      WHERE structure."cityCode" = odc."cityCode"
      AND structure."cityCode" IS NOT NULL
      AND odc.population IS NOT NULL
    `);

    // 3. Calculer populationSegment pour open_data_places à partir d'open_data_cities via cityCode
    appLogger.warn(
      "[MIGRATION] Calcul du populationSegment pour open_data_places"
    );

    await queryRunner.query(`
      UPDATE open_data_places
      SET "populationSegment" = CASE
        WHEN odc.population < 10000 THEN 'SMALL'
        WHEN odc.population BETWEEN 10000 AND 49999 THEN 'MEDIUM'
        WHEN odc.population BETWEEN 50000 AND 99999 THEN 'LARGE'
        WHEN odc.population >= 100000 THEN 'VERY_LARGE'
      END
      FROM open_data_cities odc
      WHERE open_data_places."cityCode" = odc."cityCode"
      AND open_data_places."cityCode" IS NOT NULL
      AND odc.population IS NOT NULL
    `);

    // 4. Calculer domicilieSegment pour open_data_places (basé sur leur propre data si disponible)
    // Note: open_data_places n'a pas forcément de relation directe avec les usagers
    // On peut utiliser les champs nbDomicilies ou nbDomiciliesDomifa s'ils existent
    appLogger.warn(
      "[MIGRATION] Calcul du domicilieSegment pour open_data_places"
    );

    await queryRunner.query(`
      UPDATE open_data_places
      SET "domicilieSegment" = CASE
        WHEN COALESCE("nbDomiciliesDomifa", "nbDomicilies", 0) < 10 THEN 'VERY_SMALL'
        WHEN COALESCE("nbDomiciliesDomifa", "nbDomicilies", 0) BETWEEN 10 AND 499 THEN 'SMALL'
        WHEN COALESCE("nbDomiciliesDomifa", "nbDomicilies", 0) BETWEEN 500 AND 1999 THEN 'MEDIUM'
        WHEN COALESCE("nbDomiciliesDomifa", "nbDomicilies", 0) >= 2000 THEN 'LARGE'
      END
      WHERE "nbDomiciliesDomifa" IS NOT NULL OR "nbDomicilies" IS NOT NULL
    `);

    // 5. Log des résultats
    const structureStats = await queryRunner.query(`
      SELECT
        "domicilieSegment",
        COUNT(*) as count
      FROM structure
      WHERE "domicilieSegment" IS NOT NULL
      GROUP BY "domicilieSegment"
      ORDER BY count DESC
    `);

    const structurePopulationStats = await queryRunner.query(`
      SELECT
        "populationSegment",
        COUNT(*) as count
      FROM structure
      WHERE "populationSegment" IS NOT NULL
      GROUP BY "populationSegment"
      ORDER BY count DESC
    `);

    const openDataPlacesStats = await queryRunner.query(`
      SELECT
        "populationSegment",
        COUNT(*) as count
      FROM open_data_places
      WHERE "populationSegment" IS NOT NULL
      GROUP BY "populationSegment"
      ORDER BY count DESC
    `);

    const openDataPlacesDomicilieStats = await queryRunner.query(`
      SELECT
        "domicilieSegment",
        COUNT(*) as count
      FROM open_data_places
      WHERE "domicilieSegment" IS NOT NULL
      GROUP BY "domicilieSegment"
      ORDER BY count DESC
    `);

    appLogger.warn(
      "[MIGRATION] Résultats - Structure domicilieSegment:",
      structureStats
    );
    appLogger.warn(
      "[MIGRATION] Résultats - Structure populationSegment:",
      structurePopulationStats
    );
    appLogger.warn(
      "[MIGRATION] Résultats - OpenDataPlaces populationSegment:",
      openDataPlacesStats
    );
    appLogger.warn(
      "[MIGRATION] Résultats - OpenDataPlaces domicilieSegment:",
      openDataPlacesDomicilieStats
    );

    appLogger.warn("[MIGRATION] Fin du calcul des segments");
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
