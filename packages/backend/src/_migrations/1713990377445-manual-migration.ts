import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class ManualMigration1713990377445 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.info("[MIGRATION] Mise à jour des numéros incorrects");

    await queryRunner.query(
      `UPDATE usager set "contactByPhone" = false where telephone ->> 'numero' is null and  "contactByPhone" is true`
    );

    appLogger.info("[MIGRATION] Ajout des jours pour les SMS");
    await queryRunner.query(
      `UPDATE structure SET sms = jsonb_set(sms, '{schedule}', '{ "monday": false, "tuesday": true, "wednesday": false, "thursday": true, "friday": false }'::jsonb);`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
