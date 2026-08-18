import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSupportMode1787045027655 implements MigrationInterface {
  name = "AddSupportMode1787045027655";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "support_session" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "supervisorId" integer NOT NULL, "supervisorEmail" text NOT NULL, "structureId" integer NOT NULL, "targetUserStructureId" integer NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "status" text NOT NULL DEFAULT 'ACTIVE', "revokedAt" TIMESTAMP WITH TIME ZONE, "revokedBy" text, "revokedReason" text, CONSTRAINT "PK_9775e45f6521d085ab40f7b7eb2" PRIMARY KEY ("uuid"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_45b30ad04f808d5939efad9d08" ON "support_session" ("supervisorId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5e3b5c549d564047e7d15922ca" ON "support_session" ("structureId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_support_session_structureId_status" ON "support_session" ("structureId", "status") `
    );
    await queryRunner.query(
      `ALTER TABLE "user_supervisor" ADD "support" jsonb`
    );
    await queryRunner.query(
      `ALTER TABLE "user_structure" ADD "isSupportMode" boolean NOT NULL DEFAULT false`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_structure" DROP COLUMN "isSupportMode"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_supervisor" DROP COLUMN "support"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_support_session_structureId_status"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_5e3b5c549d564047e7d15922ca"`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_45b30ad04f808d5939efad9d08"`
    );
    await queryRunner.query(`DROP TABLE "support_session"`);
  }
}
