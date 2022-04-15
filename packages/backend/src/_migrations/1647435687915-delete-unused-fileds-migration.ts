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
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(queryRunner: QueryRunner): Promise<void> {}
}
