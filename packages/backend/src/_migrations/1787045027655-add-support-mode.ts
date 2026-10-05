import { MigrationInterface, QueryRunner } from "typeorm";

// Role assumed temporarily by an admin's own structure account while a
// support attachment is active — see support-session module. Deliberately
// not in ALL_USER_STRUCTURE_ROLES.
const SUPPORT_ACCOUNT_ROLE = "support";

export class AddSupportMode1787045027655 implements MigrationInterface {
  name = "AddSupportMode1787045027655";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // "originalRole" holds the target account's real role at the moment it
    // was overwritten to "support" — restored onto user_structure.role when
    // the attachment closes (see SupportSessionService.closeSession). Never
    // deployed yet (branch unmerged), so this column lives directly on the
    // CREATE TABLE rather than a follow-up migration.
    await queryRunner.query(
      `CREATE TABLE "support_session" ("uuid" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, "supervisorId" integer NOT NULL, "supervisorEmail" text NOT NULL, "structureId" integer NOT NULL, "targetUserStructureId" integer NOT NULL, "startDate" TIMESTAMP WITH TIME ZONE NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "status" text NOT NULL DEFAULT 'ACTIVE', "originalRole" text, "revokedAt" TIMESTAMP WITH TIME ZONE, "revokedBy" text, "revokedReason" text, CONSTRAINT "PK_9775e45f6521d085ab40f7b7eb2" PRIMARY KEY ("uuid"))`
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
    // "targetUserStructureId" points at whichever structure account is
    // currently toggled to "support" — an admin's own account, or (in
    // principle) any other. This guarantees at the DB level that a single
    // account never has more than one active attachment at a time,
    // regardless of app-level races. Different admins' accounts each get
    // their own independent slot under this same index, for free.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_support_session_one_active" ON "support_session" ("targetUserStructureId") WHERE "status" = 'ACTIVE'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Defensive cleanup: a role of "support" should never be the *stored*
    // role of any account outside an active attachment window, but this
    // guards against a stuck row from a prior run of this migration.
    await queryRunner.query(
      `DELETE FROM "user_structure" WHERE "role" = '${SUPPORT_ACCOUNT_ROLE}'`
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_support_session_one_active"`
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
