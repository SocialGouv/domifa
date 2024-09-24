import { MigrationInterface, QueryRunner } from "typeorm";

export class ManualMigration1727186783887 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Compter le nombre d'enregistrements qui seront affectés
    const countResult = await queryRunner.query(`
          SELECT COUNT(*) as count
          FROM usager
          WHERE statut != 'RADIE' AND options->'npai'->>'actif' = 'true';

      `);

    const count = parseInt(countResult[0].count);

    console.log(`Nombre d'enregistrements qui seront mis à jour : ${count}`);

    // Exécuter la mise à jour
    await queryRunner.query(`
          UPDATE usager
          SET options = jsonb_set(
              options,
              '{npai}',
              '{"actif": false, "dateDebut": null}'::jsonb,
              true
          )
          WHERE statut != 'RADIE' AND options->'npai'->>'actif' = 'true';
      `);

    console.log(
      `Mise à jour terminée. ${count} enregistrements ont été modifiés.`
    );
  }

  public async down(): Promise<void> {}
}
