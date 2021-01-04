import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class autoMigration1609776115336 implements MigrationInterface {
  name = "autoMigration1609776115336";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.debug(`[Migration] UP "${this.name}"`);
    await queryRunner.query(
      `ALTER TABLE "message_email" ADD "attachments" bytea`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "message_email" DROP COLUMN "attachments"`
    );
  }
}
