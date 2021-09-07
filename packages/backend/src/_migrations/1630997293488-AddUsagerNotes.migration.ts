import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util/AppLogger.service";

export class AddUsagerNotes1630997293488 implements MigrationInterface {
  name = "AddUsagerNotes1630997293488";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn(`[${this.name}] MIGRATION UP...`);
    await queryRunner.query(
      `ALTER TABLE "public"."usager" ADD "notes" jsonb NOT NULL DEFAULT '[]'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."usager" DROP COLUMN "notes"`
    );
  }
}
