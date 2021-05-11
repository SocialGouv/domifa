import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class manualMigration1620030624718 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP manualMigration1620030624718`);

    await queryRunner.query(
      `ALTER TABLE public."structure" DROP COLUMN "mongoStructureId";`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
