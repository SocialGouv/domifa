import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class ManualMigration1713796932080 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.info("[MIGRATION] Ajout du sexe & date naissance aux stats");
    await queryRunner.query(
      `UPDATE usager_history_states SET sexe = usager.sexe, "dateNaissance" = usager."dateNaissance" FROM usager WHERE usager_history_states."usagerUUID" = usager.uuid`
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async down(_queryRunner: QueryRunner): Promise<void> {
    //
  }
}
