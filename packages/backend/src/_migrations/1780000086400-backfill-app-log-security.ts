import { MigrationInterface, QueryRunner } from "typeorm";

// Copy historical security rows from `app_log` to `app_log_security`, then
// delete them from `app_log`. Mapping:
// - userId  →  userStructureId / userSupervisorId (based on userType)
// - context.ip / context.userAgent  →  ip / userAgent top-level columns
// - usagerRef / usagerUuid: dropped (out of scope on the new table)
// - createdAt / uuid: preserved
export class BackfillAppLogSecurity1780000086400 implements MigrationInterface {
  name = "BackfillAppLogSecurity1780000086400";

  private static readonly SECURITY_ACTIONS = [
    "THROTTLE_BLOCKED",
    "REQUEST_BLOCKED",
    "BLOCK_USER",
    "BLOCK_USER_BY_ADMIN",
    "UNBLOCK_USER",
    "ACCESS_DENIED_NON_ACTIVE",
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      INSERT INTO app_log_security (
        uuid, "createdAt", "updatedAt", version,
        "userStructureId", "userSupervisorId", "userType", "structureId",
        action, context, role, "createdBy", ip, "userAgent"
      )
      SELECT
        uuid,
        "createdAt",
        "updatedAt",
        version,
        CASE WHEN "userType" = 'user_structure'  THEN "userId" END,
        CASE WHEN "userType" = 'user_supervisor' THEN "userId" END,
        "userType",
        "structureId",
        action,
        context,
        role,
        "createdBy",
        COALESCE(
          (context::jsonb) ->> 'ip',
          (context::jsonb) -> 'throttle' ->> 'ip'
        ),
        COALESCE(
          (context::jsonb) ->> 'userAgent',
          (context::jsonb) -> 'throttle' ->> 'userAgent'
        )
      FROM app_log
      WHERE action = ANY($1)
      ON CONFLICT (uuid) DO NOTHING
      `,
      [BackfillAppLogSecurity1780000086400.SECURITY_ACTIONS]
    );

    await queryRunner.query(`DELETE FROM app_log WHERE action = ANY($1)`, [
      BackfillAppLogSecurity1780000086400.SECURITY_ACTIONS,
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse copy: restore the security rows back into app_log. The
    // userStructureId/userSupervisorId columns also exist on app_log, so we
    // can write them back too — and reconstruct `userId` from whichever
    // identifier matches the userType.
    await queryRunner.query(
      `
      INSERT INTO app_log (
        uuid, "createdAt", "updatedAt", version,
        "userId", "userStructureId", "userSupervisorId", "userType",
        "structureId", action, context, role, "createdBy"
      )
      SELECT
        uuid,
        "createdAt",
        "updatedAt",
        version,
        COALESCE("userStructureId", "userSupervisorId"),
        "userStructureId",
        "userSupervisorId",
        "userType",
        "structureId",
        action,
        context,
        role,
        "createdBy"
      FROM app_log_security
      WHERE action = ANY($1)
      ON CONFLICT (uuid) DO NOTHING
      `,
      [BackfillAppLogSecurity1780000086400.SECURITY_ACTIONS]
    );

    await queryRunner.query(
      `DELETE FROM app_log_security WHERE action = ANY($1)`,
      [BackfillAppLogSecurity1780000086400.SECURITY_ACTIONS]
    );
  }
}
