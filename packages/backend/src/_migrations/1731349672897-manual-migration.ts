import { MigrationInterface, QueryRunner } from "typeorm";

import { domifaConfig } from "../config";
import { appLogger } from "../util";
import { normalizeString } from "@domifa/common";

const batchSize = 2000;
export class ManualMigration1731349672897 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      const totalCount = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM usager
            WHERE nom_prenom_surnom_ref IS NULL OR nom_prenom_surnom_ref = ''
        `);

      const totalRecords = parseInt(totalCount[0].count);
      let processedRecords = 0;

      while ((await this.getUsagersToUpdate(queryRunner)) > 0) {
        await queryRunner.startTransaction();

        try {
          // Récupère un lot d'usagers
          const usagers = await queryRunner.query(
            `SELECT uuid, ref, nom, prenom, surnom  FROM usager WHERE "nom_prenom_surnom_ref" IS NULL OR "nom_prenom_surnom_ref" = '' LIMIT ${batchSize}`
          );

          // Exécute les updates en une seule requête
          if (usagers.length > 0) {
            for (const usager of usagers) {
              const parts = [
                usager.nom,
                usager.prenom,
                usager.surnom,
                usager?.customRef ?? usager?.ref,
              ]
                .filter(Boolean)
                .map((part) => normalizeString(part.toString()));

              const nom_prenom_surnom_ref = parts.join(" ");

              await queryRunner.query(
                "UPDATE usager set nom_prenom_surnom_ref = $1 where uuid=$2",
                [nom_prenom_surnom_ref, usager.uuid]
              );
            }
          }

          await queryRunner.commitTransaction();

          processedRecords += usagers.length;
          appLogger.warn(
            `Progression: ${Math.min(
              processedRecords,
              totalRecords
            )}/${totalRecords} enregistrements traités`
          );
        } catch (error) {
          await queryRunner.rollbackTransaction();
          console.error(
            `Erreur lors du traitement du lot ${processedRecords}-${
              processedRecords + batchSize
            }:`,
            error
          );
          throw error;
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.startTransaction();

    try {
      await queryRunner.query(`
                UPDATE usager
                SET nom_prenom_surnom_ref = NULL
            `);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    }
  }

  private async getUsagersToUpdate(queryRunner: QueryRunner): Promise<number> {
    const total = await queryRunner.query(`
      SELECT COUNT(*) as count
      FROM usager
      WHERE nom_prenom_surnom_ref IS NULL OR nom_prenom_surnom_ref = ''
  `);
    return parseInt(total[0].count);
  }
}
