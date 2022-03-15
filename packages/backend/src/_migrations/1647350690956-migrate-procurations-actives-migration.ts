import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { usagerRepository } from "../database";
import { appLogger } from "../util";
import { Usager, UsagerOptions } from "../_common/model";

export class migrateProcurationsActivesMigration1647350690956
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      const usagerNotMigrate = await queryRunner.query(`
      SELECT COUNT(*) as nbusagers
      FROM usager
      WHERE (options->'procurations') is  null
       `);

      appLogger.warn(
        "[migrateProcurationsActives] Reste à migrer actuellement - " +
          usagerNotMigrate[0].nbusagers +
          " dossiers"
      );
      const countUsagersProcuration = await queryRunner.query(`
        SELECT COUNT(*) nbusagers
        FROM usager
        WHERE options->'procuration' != '{"actif": false}'::jsonb
      `);

      appLogger.warn(
        "\t Procurations actives -  " +
          countUsagersProcuration[0].nbusagers +
          " dossiers"
      );

      const usagers: Usager[] = await (
        await usagerRepository.typeorm()
      ).query(
        `
        SELECT uuid, options, "structureId"
        FROM usager
        WHERE options->'procuration' != '{"actif": false}'::jsonb
        `
      );

      appLogger.warn("\t ... Copie des données des procurations actives");

      for (const usager of usagers) {
        const options: UsagerOptions = {
          npai: usager.options.npai,
          transfert: usager.options.transfert,
          portailUsagerEnabled: usager.options?.portailUsagerEnabled ?? false,
          procurations: [
            {
              nom: usager.options.procuration?.nom ?? null,
              prenom: usager.options.procuration?.prenom ?? null,
              dateDebut: usager.options.procuration?.dateDebut ?? null,
              dateFin: usager.options.procuration?.dateFin ?? null,
              dateNaissance: usager.options.procuration?.dateNaissance ?? null,
            },
          ],
        };

        await (
          await usagerRepository.typeorm()
        )
          .createQueryBuilder("usager")
          .update()
          .set({ options })
          .where({
            uuid: usager.uuid,
          })
          .execute();
      }

      const usagerNotMigrateAfter = await queryRunner.query(`
      SELECT COUNT(*) as nbusagers
      FROM usager
      WHERE (options->'procurations') is  null
       `);

      appLogger.warn(
        "[migrateProcurationsActives] Reste à migrer après : " +
          usagerNotMigrateAfter[0].nbusagers +
          " dossiers"
      );
    }

    // PARTIE 2 : procurations inactives
    const usagersProcurationInactive: Usager[] = await queryRunner.query(`
    SELECT uuid, options, "structureId"
    FROM usager
    WHERE (options->'procuration')::jsonb->'actif' = 'false'
     `);

    appLogger.warn(
      "\t Procurations inactives - " +
        usagersProcurationInactive.length +
        " dossiers"
    );

    appLogger.warn("\t ... Copie des données des procurations actives");

    for (const usager of usagersProcurationInactive) {
      const options: UsagerOptions = {
        npai: usager.options.npai,
        transfert: usager.options.transfert,
        portailUsagerEnabled: usager.options?.portailUsagerEnabled ?? false,
        procurations: [],
      };

      await (
        await usagerRepository.typeorm()
      )
        .createQueryBuilder("usager")
        .update()
        .set({ options })
        .where({
          uuid: usager.uuid,
        })
        .execute();
    }

    const usagerNotMigrateAfterAll = await queryRunner.query(`
        SELECT COUNT(*) as nbusagers
        FROM usager
        WHERE (options->'procurations') is  null
     `);

    appLogger.warn(
      "[migrateProcurationsActives] Reste à migrer à la toute fin " +
        usagerNotMigrateAfterAll[0].nbusagers +
        " dossiers"
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
