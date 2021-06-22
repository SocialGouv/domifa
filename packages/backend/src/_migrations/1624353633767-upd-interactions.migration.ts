import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class UpdateInteractions1624353633767 implements MigrationInterface {
  name = "UpdateInteractions1624353633767";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP ${this.name}`);
    await queryRunner.query(
      `ALTER TABLE "interactions" ADD "event" text NOT NULL DEFAULT 'create'`
    );
    await queryRunner.query(
      `ALTER TABLE "interactions" ADD "previousValue" jsonb`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interactions" DROP COLUMN "previousValue"`
    );
    await queryRunner.query(`ALTER TABLE "interactions" DROP COLUMN "event"`);
  }
}
