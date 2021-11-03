import { MigrationInterface, QueryRunner } from "typeorm";
import { appLogger } from "../util";

export class migration1635931181879 implements MigrationInterface {
  name = "migration1635931181879";

  public async up(queryRunner: QueryRunner): Promise<void> {
    appLogger.warn(`[${this.name}] MIGRATION UP...`);
    await queryRunner.query(
      `CREATE INDEX "IDX_3ff6384b58d9d6c5e66104a3e0" ON "message_sms" ("usagerRef") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dae89d90feda082fad814da8a4" ON "message_sms" ("structureId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7fd081c7b024fd7837e6d1923c" ON "message_sms" ("status") `
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_7fd081c7b024fd7837e6d1923c"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dae89d90feda082fad814da8a4"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3ff6384b58d9d6c5e66104a3e0"`
    );
  }
}
