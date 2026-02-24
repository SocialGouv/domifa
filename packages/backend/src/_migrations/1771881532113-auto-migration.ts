import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class AutoMigration1771881532113 implements MigrationInterface {
  name = "AutoMigration1771881532113";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "local" ||
      domifaConfig().envId === "preprod"
    ) {
      // Ajouter la colonne siret à la table open_data_places
      await queryRunner.query(
        `ALTER TABLE open_data_places ADD COLUMN IF NOT EXISTS siret TEXT NULL`
      );

      await queryRunner.query(
        `DELETE FROM open_data_places where source != 'dgcs'`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Supprimer la colonne siret
    await queryRunner.query(
      `ALTER TABLE open_data_places DROP COLUMN IF EXISTS siret`
    );
  }
}
