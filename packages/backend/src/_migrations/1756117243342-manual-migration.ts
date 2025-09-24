import { MigrationInterface, QueryRunner } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { appLogger } from "../util";
import { UsagerTable } from "../database";

export class AddUuidToUsagerHistorique1756117243342
  implements MigrationInterface
{
  name = "addUuidToUsagerHistorique1756117243342";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn(
      "Début de la migration: ajout UUID aux éléments d'historique"
    );

    const countResult = await queryRunner.query(`
      SELECT COUNT(*) as total
      FROM usager u
      WHERE u.historique IS NOT NULL
        AND jsonb_array_length(u.historique) > 0
        AND EXISTS (
            SELECT 1
            FROM jsonb_array_elements(u.historique) AS hist_elem
            WHERE hist_elem->>'uuid' IS NULL
               OR hist_elem->'uuid' IS NULL
               OR NOT (hist_elem ? 'uuid')
        )
    `);

    const totalUsagers = parseInt(countResult[0].total, 10);
    appLogger.warn(`Total d'usagers concernés: ${totalUsagers}`);

    if (totalUsagers === 0) {
      appLogger.warn("Aucun usager concerné, fin de la migration");
      return;
    }

    // Récupérer tous les usagers concernés
    const usagersResult = await queryRunner.query(`
      SELECT u.uuid, u.historique
      FROM usager u
      WHERE u.historique IS NOT NULL
        AND jsonb_array_length(u.historique) > 0
        AND EXISTS (
            SELECT 1
            FROM jsonb_array_elements(u.historique) AS hist_elem
            WHERE hist_elem->>'uuid' IS NULL
               OR hist_elem->'uuid' IS NULL
               OR NOT (hist_elem ? 'uuid')
        )
      ORDER BY u.uuid
    `);

    const batchSize = 200;
    let processedCount = 0;

    // Traitement par batch de 200
    for (let i = 0; i < usagersResult.length; i += batchSize) {
      const batch = usagersResult.slice(i, i + batchSize);

      const manager = queryRunner.manager;
      await queryRunner.startTransaction();

      try {
        appLogger.warn(
          `Traitement du batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            usagersResult.length / batchSize
          )} (${batch.length} usagers)`
        );

        for (const usager of batch) {
          const historique = usager.historique;
          let modified = false;

          for (const decision of historique) {
            if (
              !decision?.uuid ||
              decision?.uuid === null ||
              decision?.uuid === undefined
            ) {
              decision.uuid = uuidv4();
              modified = true;
            }
          }
          if (modified) {
            await manager.update(
              UsagerTable,
              { uuid: usager.uuid },
              { historique }
            );
            processedCount++;
          }
        }

        await queryRunner.commitTransaction();
        appLogger.warn(
          `Batch traité avec succès (${processedCount} usagers modifiés au total)`
        );
      } catch (error) {
        await queryRunner.rollbackTransaction();
        appLogger.error(
          `Erreur lors du traitement du batch ${
            Math.floor(i / batchSize) + 1
          }:`,
          error
        );
        throw error;
      }
    }

    // Vérification finale
    const finalCountResult = await queryRunner.query(`
      SELECT COUNT(*) as remaining
      FROM usager u
      WHERE u.historique IS NOT NULL
        AND jsonb_array_length(u.historique) > 0
        AND EXISTS (
            SELECT 1
            FROM jsonb_array_elements(u.historique) AS hist_elem
            WHERE hist_elem->>'uuid' IS NULL
               OR hist_elem->'uuid' IS NULL
               OR NOT (hist_elem ? 'uuid')
        )
    `);

    const remainingUsagers = parseInt(finalCountResult[0].remaining, 10);

    if (remainingUsagers === 0) {
      appLogger.warn(
        `Migration réussie: ${processedCount} usagers modifiés, 0 usager restant sans UUID`
      );
    } else {
      appLogger.error(
        `Migration incomplète: ${remainingUsagers} usagers restent sans UUID`
      );
      throw new Error(
        `Migration incomplète: ${remainingUsagers} usagers restent sans UUID`
      );
    }
  }

  public async down(): Promise<void> {
    appLogger.warn(
      "Rollback de la migration: suppression des UUID ajoutés dans l'historique"
    );

    appLogger.warn(
      "Rollback ignoré pour éviter la suppression d'UUID légitimes"
    );
  }
}
