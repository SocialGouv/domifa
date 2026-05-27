import { SecurityLogAction } from "@domifa/common";

import { appLogSecurityRepository } from "../../database";
import { UserProfile } from "../../_common/model";
import { userTypeFromProfile } from "./app-logs.helpers";

// Returns the count of app_log_security rows for the given user that match the
// listed actions and were created within the last `sinceMinutes`. If
// `resetByActions` is provided, rows older than the most recent occurrence of
// any of these actions (for the same user) are excluded — this is how the
// "RESET_PASSWORD_SUCCESS clears the lockout counter" semantic is enforced.
export async function countSecurityEventsForUser({
  profile,
  userId,
  actions,
  sinceMinutes,
  resetByActions,
}: {
  profile: UserProfile;
  userId: number;
  actions: readonly SecurityLogAction[];
  sinceMinutes: number;
  resetByActions?: readonly SecurityLogAction[];
}): Promise<number> {
  if (!userId || actions.length === 0) {
    return 0;
  }

  const userType = userTypeFromProfile(profile);
  const userColumn =
    userType === "user_structure"
      ? '"userStructureId"'
      : userType === "user_supervisor"
      ? '"userSupervisorId"'
      : '"userUsagerId"';

  const params: unknown[] = [userId, actions, sinceMinutes];
  let query = `
    SELECT COUNT(*)::int AS count
    FROM app_log_security
    WHERE ${userColumn} = $1
      AND action = ANY($2)
      AND "createdAt" > NOW() - ($3 || ' minutes')::interval
  `;

  if (resetByActions && resetByActions.length > 0) {
    params.push(resetByActions);
    query += `
      AND "createdAt" > COALESCE(
        (
          SELECT MAX("createdAt") FROM app_log_security
          WHERE ${userColumn} = $1
            AND action = ANY($${params.length})
        ),
        '-infinity'::timestamptz
      )
    `;
  }

  const result = await appLogSecurityRepository.query(query, params);
  return Number(result?.[0]?.count ?? 0);
}

// Returns count + the timestamp of the most recent matching row. Same
// filtering rules as countSecurityEventsForUser (time window, optional
// reset-by clause). Used by the lockout backoff so it can compute when the
// block expires (= last failed event + lock duration).
export async function summarizeSecurityEventsForUser({
  profile,
  userId,
  actions,
  sinceMinutes,
  resetByActions,
}: {
  profile: UserProfile;
  userId: number;
  actions: readonly SecurityLogAction[];
  sinceMinutes: number;
  resetByActions?: readonly SecurityLogAction[];
}): Promise<{ count: number; lastEventDate: Date | null }> {
  if (!userId || actions.length === 0) {
    return { count: 0, lastEventDate: null };
  }

  const userType = userTypeFromProfile(profile);
  const userColumn =
    userType === "user_structure"
      ? '"userStructureId"'
      : userType === "user_supervisor"
      ? '"userSupervisorId"'
      : '"userUsagerId"';

  const params: unknown[] = [userId, actions, sinceMinutes];
  let query = `
    SELECT COUNT(*)::int AS count, MAX("createdAt") AS "lastEventDate"
    FROM app_log_security
    WHERE ${userColumn} = $1
      AND action = ANY($2)
      AND "createdAt" > NOW() - ($3 || ' minutes')::interval
  `;

  if (resetByActions && resetByActions.length > 0) {
    params.push(resetByActions);
    query += `
      AND "createdAt" > COALESCE(
        (
          SELECT MAX("createdAt") FROM app_log_security
          WHERE ${userColumn} = $1
            AND action = ANY($${params.length})
        ),
        '-infinity'::timestamptz
      )
    `;
  }

  const result = await appLogSecurityRepository.query(query, params);
  const row = result?.[0];
  return {
    count: Number(row?.count ?? 0),
    lastEventDate: row?.lastEventDate ? new Date(row.lastEventDate) : null,
  };
}
