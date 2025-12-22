import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

export class ManualMigration1766362260648 implements MigrationInterface {
  name = "UpdateNationaliteOutreMerToFrance1766362260648";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "local" ||
      domifaConfig().envId === "preprod"
    ) {
      // Liste des territoires d'outre-mer français à remplacer par "France"
      const territoriesOutreMer = [
        "Guadeloupe",
        "Martinique",
        "Guyane",
        "Guyane française",
        "La Réunion",
        "Réunion",
        "Mayotte",
        "Saint-Pierre-et-Miquelon",
        "Saint-Martin",
        "Saint-Barthélemy",
        "Polynésie française",
        "Nouvelle-Calédonie",
        "Wallis-et-Futuna",
        "Wallis et Futuna",
      ];

      // Mise à jour de la table usager
      await queryRunner.query(
        `
      UPDATE usager
      SET nationalite = 'France'
      WHERE nationalite IN (${territoriesOutreMer
        .map((_, i) => `$${i + 1}`)
        .join(", ")})
    `,
        territoriesOutreMer
      );

      // Mise à jour de la table usager_history_states
      await queryRunner.query(
        `
      UPDATE usager_history_states
      SET nationalite = 'France'
      WHERE nationalite IN (${territoriesOutreMer
        .map((_, i) => `$${i + 1}`)
        .join(", ")})
    `,
        territoriesOutreMer
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
