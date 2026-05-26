import { MigrationInterface, QueryRunner } from "typeorm";
import { domifaConfig } from "../config";

// Realign `userId` / `userType` on security-related app_log rows so they point
// to the SUBJECT (the user being blocked / unblocked / denied) rather than the
// actor (system or admin). Once the data is consistent, findUserLogs can stay
// on the simple `{ userId, userType }` filter — no JSONB lookup required.
//
// Affected actions:
//   - BLOCK_USER (auto-block by AppThrottlerGuard) — was userType = "system"
//   - ACCESS_DENIED_NON_ACTIVE (AppUserGuard)     — was userType = "system"
//   - BLOCK_USER_BY_ADMIN                          — was userId = admin.id
//   - UNBLOCK_USER                                 — was userId = admin.id
//
// For admin-triggered rows we also preserve the admin identifier in
// userSupervisorId (already set by buildSupervisorActorFields, no-op cast).
export class AppLogTargetUserOnSecurityActions1779996279014
  implements MigrationInterface
{
  name = "AppLogTargetUserOnSecurityActions1779996279014";

  public async up(qr: QueryRunner): Promise<void> {
    if (
      domifaConfig().envId === "prod" ||
      domifaConfig().envId === "preprod" ||
      domifaConfig().envId === "local"
    ) {
      // 1. System-triggered actions (BLOCK_USER auto, ACCESS_DENIED_NON_ACTIVE):
      //    userType = "system" → swap to the target's actual profile.
      await qr.query(`
      UPDATE app_log
      SET
        "userId" = NULLIF(("context"::jsonb->>'userId'), '')::int,
        "userType" = CASE
          WHEN "context"::jsonb->>'userProfile' = 'structure'  THEN 'user_structure'
          WHEN "context"::jsonb->>'userProfile' = 'supervisor' THEN 'user_supervisor'
          WHEN "context"::jsonb->>'userProfile' = 'usager'     THEN 'usager'
          ELSE "userType"
        END
      WHERE action IN ('BLOCK_USER', 'ACCESS_DENIED_NON_ACTIVE')
        AND "userType" = 'system'
        AND "context" IS NOT NULL
        AND "context"::jsonb ? 'userId'
        AND "context"::jsonb ? 'userProfile'
    `);

      // 2. Admin-triggered targeted actions (BLOCK_USER_BY_ADMIN, UNBLOCK_USER):
      //    `userId` was the admin (= userSupervisorId). Swap it to the target.
      //    `userType` was always "user_supervisor" — must reflect the target's
      //    profile (could be "user_structure" when the admin blocks a structure
      //    user via admin-structures.controller).
      await qr.query(`
      UPDATE app_log
      SET
        "userId" = NULLIF(("context"::jsonb->>'userId'), '')::int,
        "userType" = CASE
          WHEN "context"::jsonb->>'userProfile' = 'structure'  THEN 'user_structure'
          WHEN "context"::jsonb->>'userProfile' = 'supervisor' THEN 'user_supervisor'
          WHEN "context"::jsonb->>'userProfile' = 'usager'     THEN 'usager'
          ELSE "userType"
        END
      WHERE action IN ('BLOCK_USER_BY_ADMIN', 'UNBLOCK_USER')
        AND "context" IS NOT NULL
        AND "context"::jsonb ? 'userId'
        AND "context"::jsonb ? 'userProfile'
        AND "userSupervisorId" IS NOT NULL
    `);
    }
  }

  // Data backfill: not reversible without losing information that subsequent
  // writers fill correctly. Down() is intentionally a no-op.
  public async down(): Promise<void> {
    return;
  }
}
