import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class manualMigration1618928713316 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP manualMigration1618928713316`);

    await queryRunner.query(
      `update usager set entretien = entretien || jsonb_build_object('typeMenage', 'HOMME_ISOLE_SANS_ENFANT') where  entretien->>'typeMenage' = 'HOMME_iSOLE_SANS_ENFANT';`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
