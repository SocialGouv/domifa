import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

import { appLogger } from "../util";

export class migrateDefaultProcurationsMigration1647348562851
  implements MigrationInterface
{
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async up(_queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      const usagerNotMigrateBefore = await _queryRunner.query(`
      SELECT COUNT(*) as nbusagers
      FROM usager
      WHERE (options->'procurations') is  null
       `);

      appLogger.warn(
        "[migrateDefaultProcurations] Reste à migrer avant la premiere requete -  " +
          usagerNotMigrateBefore[0].nbusagers +
          " dossiers"
      );

      // 1. On met à jour tous les dossiers avec des éléments par défaut

      const countUsagersDefault = await _queryRunner.query(`
        SELECT COUNT(*) as nbUsagers
        FROM usager
        WHERE
        options = '{ "npai": { "actif": false }, "transfert": { "actif": false }, "historique": { "transfert": [], "procuration": [] }, "procuration": { "actif": false } }'::jsonb
        OR
        options = '{"npai": {"actif": false}, "transfert": {"nom": null, "actif": false, "adresse": null}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}'
        OR
        options = '{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}'
        OR
        options = '{"npai": {"actif": false, "dateDebut": null}, "transfert": {"actif": false}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}'
        OR
        options = '{"dnp": {"actif": false}, "npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}'
        `);

      appLogger.warn(
        "[migrateDefaultProcurations] Migration des données par défaut -  " +
          countUsagersDefault[0].nbusagers +
          " dossiers"
      );

      await _queryRunner.query(
        `
        UPDATE usager
        SET options = '{ "transfert":{ "actif":false, "nom":null, "adresse":null, "dateDebut":null, "dateFin":null }, "procurations":[], "npai":{ "actif":false, "dateDebut":null }, "portailUsagerEnabled": false}'
        WHERE
        options = '{ "npai": { "actif": false }, "transfert": { "actif": false }, "historique": { "transfert": [], "procuration": [] }, "procuration": { "actif": false } }'::jsonb
        OR
        options = '{"npai": {"actif": false}, "transfert": {"nom": null, "actif": false, "adresse": null}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}'
        OR
        options = '{"npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}'
        OR
        options = '{"npai": {"actif": false, "dateDebut": null}, "transfert": {"actif": false}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}'
        OR
        options = '{"dnp": {"actif": false}, "npai": {"actif": false, "dateDebut": null}, "transfert": {"nom": null, "actif": false, "adresse": null}, "historique": {"transfert": [], "procuration": []}, "procuration": {"actif": false}}'
      `
      );

      const usagerNotMigrate = await _queryRunner.query(`
      SELECT COUNT(*) as nbusagers
      FROM usager
      WHERE (options->'procurations') is  null
       `);

      appLogger.warn(
        "[migrateDefaultProcurations] Reste à migrer après   " +
          usagerNotMigrate[0].nbusagers +
          " dossiers"
      );
      appLogger.warn("");
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(): Promise<void> {}
}
