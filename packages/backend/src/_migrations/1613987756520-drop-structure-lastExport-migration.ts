import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class autoMigration1613987756520 implements MigrationInterface {
  name = "autoMigration1613987756520";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP "${this.name}"`);
    await queryRunner.query(`ALTER TABLE "structure" DROP COLUMN "lastExport"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "structure" ADD "lastExport" date`);
  }
}
