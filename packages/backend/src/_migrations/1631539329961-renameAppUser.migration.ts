import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class renameAppUserMigration1631539329961 implements MigrationInterface {
  name = "renameAppUserMigration1631539329961";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn(`[${this.name}] MIGRATION UP...`);
    await queryRunner.query(
      `ALTER TABLE public.app_user_security RENAME TO user_structure_security;`
    );
    await queryRunner.query(
      `ALTER TABLE public.app_user RENAME TO user_structure;`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
