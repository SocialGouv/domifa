import { MigrationInterface, QueryRunner } from "typeorm";

// Snapshot the actor / subject display name ("prenom nom") on every existing
// `app_log` and `app_log_security` row so structure-level listings can render
// a "Utilisateur" column without a runtime LEFT JOIN against three different
// user tables. Future writes populate the column directly from the writer.
//
// `app_log` records the ACTOR (`userStructureId` / `userSupervisorId`).
// `app_log_security` records the SUBJECT (same FK columns). Both shapes use
// the matching user_* table to source the name.
export class AddUserNameOnAppLogs1780200000000 implements MigrationInterface {
  name = "AddUserNameOnAppLogs1780200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "app_log" ADD COLUMN IF NOT EXISTS "userName" text`
    );
    await queryRunner.query(
      `ALTER TABLE "app_log_security" ADD COLUMN IF NOT EXISTS "userName" text`
    );

    // app_log: structure actors
    await queryRunner.query(`
      UPDATE "app_log" log
      SET "userName" = TRIM(CONCAT(u.prenom, ' ', u.nom))
      FROM "user_structure" u
      WHERE log."userStructureId" = u.id
        AND log."userName" IS NULL
    `);

    // app_log: supervisor actors
    await queryRunner.query(`
      UPDATE "app_log" log
      SET "userName" = TRIM(CONCAT(u.prenom, ' ', u.nom))
      FROM "user_supervisor" u
      WHERE log."userSupervisorId" = u.id
        AND log."userName" IS NULL
    `);

    // app_log_security: structure subjects
    await queryRunner.query(`
      UPDATE "app_log_security" log
      SET "userName" = TRIM(CONCAT(u.prenom, ' ', u.nom))
      FROM "user_structure" u
      WHERE log."userStructureId" = u.id
        AND log."userName" IS NULL
    `);

    // app_log_security: supervisor subjects
    await queryRunner.query(`
      UPDATE "app_log_security" log
      SET "userName" = TRIM(CONCAT(u.prenom, ' ', u.nom))
      FROM "user_supervisor" u
      WHERE log."userSupervisorId" = u.id
        AND log."userName" IS NULL
    `);

    // app_log_security: usager subjects (login uses a `login` field, not a
    // full name — fall back to that since it's the only handle we have).
    await queryRunner.query(`
      UPDATE "app_log_security" log
      SET "userName" = u.login
      FROM "user_usager" u
      WHERE log."userUsagerId" = u.id
        AND log."userName" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "app_log" DROP COLUMN IF EXISTS "userName"`
    );
    await queryRunner.query(
      `ALTER TABLE "app_log_security" DROP COLUMN IF EXISTS "userName"`
    );
  }
}
