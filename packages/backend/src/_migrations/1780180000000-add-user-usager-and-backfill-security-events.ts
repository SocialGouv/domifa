import { MigrationInterface, QueryRunner } from "typeorm";

// Two changes:
//
// 1. Add `userUsagerId` to `app_log_security` so the table can also hold
//    security events for portail-usagers accounts. Until now only structure
//    and supervisor users were tracked there.
//
// 2. Backfill historical `eventsHistory` rows (JSONB on the 3 user_*_security
//    tables) into `app_log_security`, one user at a time. Iterating in JS
//    rather than running a raw INSERT ... SELECT ... jsonb_array_elements
//    keeps the conversion auditable (per-row event count, skipped types
//    logged) and lets us reuse the action mapping verbatim. The legacy
//    `eventsHistory` column is left in place — a follow-up migration drops
//    it once the dependent code is fully migrated.
//
// UserSecurityEventType → SecurityLogAction:
//   login-error             → LOGIN_ERROR
//   login-success           → LOGIN_SUCCESS
//   change-password-error   → CHANGE_PASSWORD_ERROR
//   change-password-success → CHANGE_PASSWORD_SUCCESS
//   reset-password-request  → RESET_PASSWORD_REQUEST
//   reset-password-success  → RESET_PASSWORD_SUCCESS
//   reset-password-error    → RESET_PASSWORD_ERROR
//   validate-account-success → VALIDATE_ACCOUNT_SUCCESS
//   validate-account-error  → VALIDATE_ACCOUNT_ERROR
//   account-unblocked       → UNBLOCK_USER

type LegacyEvent = { type?: string; date?: string };

const EVENT_TYPE_TO_ACTION: Record<string, string> = {
  "login-error": "LOGIN_ERROR",
  "login-success": "LOGIN_SUCCESS",
  "change-password-error": "CHANGE_PASSWORD_ERROR",
  "change-password-success": "CHANGE_PASSWORD_SUCCESS",
  "reset-password-request": "RESET_PASSWORD_REQUEST",
  "reset-password-success": "RESET_PASSWORD_SUCCESS",
  "reset-password-error": "RESET_PASSWORD_ERROR",
  "validate-account-success": "VALIDATE_ACCOUNT_SUCCESS",
  "validate-account-error": "VALIDATE_ACCOUNT_ERROR",
  "account-unblocked": "UNBLOCK_USER",
};

const BACKFILL_CREATED_BY = "backfill_user_security_events_history";

type SourceProfile = {
  table: string;
  userType: "user_structure" | "user_supervisor" | "usager";
  hasStructureId: boolean;
  userIdColumn: "userStructureId" | "userSupervisorId" | "userUsagerId";
};

const SOURCES: SourceProfile[] = [
  {
    table: "user_structure_security",
    userType: "user_structure",
    hasStructureId: true,
    userIdColumn: "userStructureId",
  },
  {
    table: "user_supervisor_security",
    userType: "user_supervisor",
    hasStructureId: false,
    userIdColumn: "userSupervisorId",
  },
  {
    table: "user_usager_security",
    userType: "usager",
    hasStructureId: true,
    userIdColumn: "userUsagerId",
  },
];

export class AddUserUsagerAndBackfillSecurityEvents1780180000000
  implements MigrationInterface
{
  name = "AddUserUsagerAndBackfillSecurityEvents1780180000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "app_log_security" ADD COLUMN IF NOT EXISTS "userUsagerId" integer`
    );

    for (const source of SOURCES) {
      const structureColumnSelect = source.hasStructureId
        ? ', "structureId"'
        : "";
      const rows = await queryRunner.query(
        `SELECT "userId", "eventsHistory"${structureColumnSelect}
         FROM "${source.table}"
         WHERE jsonb_typeof("eventsHistory") = 'array'
           AND jsonb_array_length("eventsHistory") > 0`
      );

      let inserted = 0;
      let skipped = 0;

      for (const row of rows as Array<{
        userId: number;
        eventsHistory: LegacyEvent[];
        structureId?: number;
      }>) {
        const events = Array.isArray(row.eventsHistory)
          ? row.eventsHistory
          : [];
        for (const event of events) {
          if (!event?.type || !event?.date) {
            skipped += 1;
            continue;
          }
          const action = EVENT_TYPE_TO_ACTION[event.type];
          if (!action) {
            skipped += 1;
            continue;
          }
          await queryRunner.query(
            `INSERT INTO "app_log_security" (
                "createdAt", "updatedAt", version,
                "${source.userIdColumn}", "userType", "structureId",
                "action", "context", "createdBy"
              ) VALUES (
                $1, $1, 1, $2, $3, $4, $5, $6, $7
              )`,
            [
              event.date,
              row.userId,
              source.userType,
              source.hasStructureId ? row.structureId ?? null : null,
              action,
              JSON.stringify({ backfilledFrom: source.table }),
              BACKFILL_CREATED_BY,
            ]
          );
          inserted += 1;
        }
      }

      // eslint-disable-next-line no-console
      console.log(
        `[backfill] ${source.table}: ${inserted} event(s) inserted, ${skipped} skipped`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "app_log_security" WHERE "createdBy" = $1`,
      [BACKFILL_CREATED_BY]
    );
    await queryRunner.query(
      `ALTER TABLE "app_log_security" DROP COLUMN IF EXISTS "userUsagerId"`
    );
  }
}
