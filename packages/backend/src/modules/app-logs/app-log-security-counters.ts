import { SecurityLogAction } from "@domifa/common";

import { appLogSecurityRepository } from "../../database";
import { UserProfile } from "../../_common/model";
import { userTypeFromProfile } from "./app-logs.helpers";
import { AppLogActorType } from "./types";

// Strict whitelist: the column name is interpolated into the query, so it
// must never come from anywhere other than this map.
const USER_ID_COLUMN_BY_TYPE: Partial<
  Record<
    AppLogActorType,
    "userStructureId" | "userSupervisorId" | "userUsagerId"
  >
> = {
  user_structure: "userStructureId",
  user_supervisor: "userSupervisorId",
  usager: "userUsagerId",
};

type EventsSummary = { count: number; lastEventDate: Date | null };

export async function countSecurityEventsForUser(args: {
  profile: UserProfile;
  userId: number;
  actions: readonly SecurityLogAction[];
  sinceMinutes: number;
  resetByActions?: readonly SecurityLogAction[];
}): Promise<number> {
  const { count } = await summarizeSecurityEventsForUser(args);
  return count;
}

// `resetByActions` excludes rows older than the most recent occurrence of any
// listed action for the same user — that's how RESET_PASSWORD_SUCCESS clears
// the lockout counter.
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
}): Promise<EventsSummary> {
  if (!userId || actions.length === 0) {
    return { count: 0, lastEventDate: null };
  }

  const userType = userTypeFromProfile(profile);
  const column = USER_ID_COLUMN_BY_TYPE[userType];
  if (!column) {
    return { count: 0, lastEventDate: null };
  }

  const sinceDate = new Date(Date.now() - sinceMinutes * 60_000);

  const qb = appLogSecurityRepository
    .createQueryBuilder("log")
    .select("COUNT(*)::int", "count")
    .addSelect(`MAX(log."createdAt")`, "lastEventDate")
    .where(`log."${column}" = :userId`, { userId })
    .andWhere("log.action IN (:...actions)", { actions: [...actions] })
    .andWhere(`log."createdAt" > :since`, { since: sinceDate });

  if (resetByActions && resetByActions.length > 0) {
    const resetSubQuery = appLogSecurityRepository
      .createQueryBuilder("reset")
      .select(`MAX(reset."createdAt")`)
      .where(`reset."${column}" = :resetUserId`, { resetUserId: userId })
      .andWhere("reset.action IN (:...resetActions)", {
        resetActions: [...resetByActions],
      })
      .getQuery();

    qb.andWhere(
      `log."createdAt" > COALESCE((${resetSubQuery}), '-infinity'::timestamptz)`
    );
  }

  const row = await qb.getRawOne<{
    count: number | string;
    lastEventDate: Date | string | null;
  }>();

  return {
    count: Number(row?.count ?? 0),
    lastEventDate: row?.lastEventDate ? new Date(row.lastEventDate) : null,
  };
}
