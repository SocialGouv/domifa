import { MigrationInterface, QueryRunner } from "typeorm";

// Splits historical LOGIN_ERROR rows: anonymous rows (no userId resolved at
// the time of the attempt) reflect an enumeration probe on an unknown
// email/login, not a wrong-password attempt against a real account. The
// password-checker code paths now write LOGIN_UNKNOWN_USER for those — this
// migration retro-fits the same split on past data so existing dashboards
// and queries don't mix the two signals.
export class BackfillLoginUnknownUser1780321080015
  implements MigrationInterface
{
  name = "BackfillLoginUnknownUser1780321080015";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "app_log_security"
         SET "action" = 'LOGIN_UNKNOWN_USER'
         WHERE "action" = 'LOGIN_ERROR'
           AND "userType" = 'anonymous'`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "app_log_security"
         SET "action" = 'LOGIN_ERROR'
         WHERE "action" = 'LOGIN_UNKNOWN_USER'`
    );
  }
}
