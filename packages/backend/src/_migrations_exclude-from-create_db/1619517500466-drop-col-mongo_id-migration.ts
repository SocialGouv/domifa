import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class manualMigration1619517500466 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP manualMigration1619517500466`);
    await queryRunner.query(`ALTER TABLE public.app_user DROP COLUMN "_id";`);
    await queryRunner.query(
      `ALTER TABLE public.interactions DROP COLUMN "_id";`
    );
    await queryRunner.query(`ALTER TABLE public.structure DROP COLUMN "_id";`);
    await queryRunner.query(
      `ALTER TABLE public.structure_stats DROP COLUMN "_id";`
    );
    await queryRunner.query(`ALTER TABLE public.usager DROP COLUMN "_id";`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
