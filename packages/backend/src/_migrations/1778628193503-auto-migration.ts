import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config/domifaConfig.service";

export class AutoMigration1778628193503 implements MigrationInterface {
  name = "AutoMigration1778628193503";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "local" ||
      domifaConfig().envId === "preprod"
    ) {
      await queryRunner.query(
        `ALTER TABLE "user_supervisor_security" ADD "fingerprintHash" text`
      );
      await queryRunner.query(
        `ALTER TABLE "user_supervisor_security" ADD "currentSession" jsonb`
      );
      await queryRunner.query(
        `ALTER TABLE "user_supervisor_security" ADD "sessionsHistory" jsonb NOT NULL DEFAULT '[]'`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure_security" ADD "fingerprintHash" text`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure_security" ADD "currentSession" jsonb`
      );
      await queryRunner.query(
        `ALTER TABLE "user_structure_security" ADD "sessionsHistory" jsonb NOT NULL DEFAULT '[]'`
      );
      await queryRunner.query(
        `ALTER TABLE "user_usager_security" ADD "fingerprintHash" text`
      );
      await queryRunner.query(
        `ALTER TABLE "user_usager_security" ADD "currentSession" jsonb`
      );
      await queryRunner.query(
        `ALTER TABLE "user_usager_security" ADD "sessionsHistory" jsonb NOT NULL DEFAULT '[]'`
      );

      await queryRunner.query(
        `CREATE INDEX "IDX_4cc53946a17ae327fa3c66d1d2" ON "user_supervisor_security" ("fingerprintHash") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_94e6ad00ef549a73fe820195fd" ON "user_structure_security" ("fingerprintHash") `
      );
      await queryRunner.query(
        `CREATE INDEX "IDX_1e6bd6ecf3ffebfc8df03507ed" ON "user_usager_security" ("fingerprintHash") `
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_1e6bd6ecf3ffebfc8df03507ed"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_94e6ad00ef549a73fe820195fd"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_4cc53946a17ae327fa3c66d1d2"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP COLUMN "fonctionDetail"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD "fonctionDetail" character varying(255)`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'`
    );
    await queryRunner.query(
      `ALTER TABLE "structure" ALTER COLUMN "sms" SET DEFAULT '{"senderName": null, "senderDetails": null, "enabledByDomifa": true, "enabledByStructure": false}'`
    );
    await queryRunner.query(
      `ALTER TABLE "user_supervisor" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" DROP COLUMN "sessionsHistory"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" DROP COLUMN "currentSession"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_usager_security" DROP COLUMN "fingerprintHash"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" DROP COLUMN "sessionsHistory"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" DROP COLUMN "currentSession"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure_security" DROP COLUMN "fingerprintHash"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_supervisor_security" DROP COLUMN "sessionsHistory"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_supervisor_security" DROP COLUMN "currentSession"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_supervisor_security" DROP COLUMN "fingerprintHash"`
    );
  }
}
