import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";
import { appLogger } from "../util";

export class setDefaultOptionsUsagerMigration1647435687915
  implements MigrationInterface
{
  name = "setDefaultOptionsUsagerMigration1647435687915";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      appLogger.warn(
        "[MIGRATION] Suppression de la colonne inutile dans les SMS  "
      );

      await queryRunner.query(
        `ALTER TABLE "message_sms" DROP COLUMN "statusUpdates"`
      );

      appLogger.warn(
        "[MIGRATION] Mise à jour de la colonne Options dans usagers"
      );

      await queryRunner.query(
        `ALTER TABLE "usager" ALTER COLUMN "options" SET DEFAULT '{ "transfert":{ "actif":false, "nom":null, "adresse":null, "dateDebut":null, "dateFin":null }, "procurations":[], "npai":{ "actif":false, "dateDebut":null }, "portailUsagerEnabled":false }'`
      );

      appLogger.warn(
        "[MIGRATION] Suppression de colonnes inutiles dans l'historique"
      );
      await queryRunner.query(
        `ALTER TABLE "usager_options_history" ALTER COLUMN "userId" DROP NOT NULL`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_options_history" ALTER COLUMN "userName" DROP NOT NULL`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_options_history" ALTER COLUMN "structureId" DROP NOT NULL`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_options_history" ALTER COLUMN "dateDebut" DROP NOT NULL`
      );
      await queryRunner.query(
        `ALTER TABLE "usager_options_history" ALTER COLUMN "dateFin" DROP NOT NULL`
      );

      await queryRunner.query(
        `ALTER TABLE "interactions" ADD CONSTRAINT "FK_495b59d0dd15e43b262f2da8907" FOREIGN KEY ("interactionOutUUID") REFERENCES "interactions"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`
      );
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
