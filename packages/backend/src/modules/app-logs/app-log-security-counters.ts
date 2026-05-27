import { In, MoreThan } from "typeorm";

import { SecurityLogAction } from "@domifa/common";

import { appLogSecurityRepository } from "../../database";
import { UserProfile } from "../../_common/model";
import { userTypeFromProfile } from "./app-logs.helpers";
import { AppLogActorType } from "./types";

// Strict whitelist of the FK column targeted per profile.
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

// Single TypeORM query that pulls every action of interest (failed + reset)
// in the time window, then filters in JS: any row older than the most recent
// reset doesn't count. Keeps the SQL trivial and the logic explicit.
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

  const column = USER_ID_COLUMN_BY_TYPE[userTypeFromProfile(profile)];
  if (!column) {
    return { count: 0, lastEventDate: null };
  }

  const failedActions = new Set<string>(actions);
  const resetActions = new Set<string>(resetByActions ?? []);
  const sinceDate = new Date(Date.now() - sinceMinutes * 60_000);

  const events = await appLogSecurityRepository.find({
    where: {
      [column]: userId,
      action: In([...failedActions, ...resetActions]),
      createdAt: MoreThan(sinceDate),
    },
    order: { createdAt: "DESC" },
    select: { action: true, createdAt: true },
  });

  let count = 0;
  let lastEventDate: Date | null = null;
  for (const event of events) {
    // Newest-first scan: stop counting failures as soon as we hit a reset.
    if (resetActions.has(event.action)) {
      break;
    }
    if (failedActions.has(event.action)) {
      count += 1;
      if (!lastEventDate) {
        lastEventDate = event.createdAt!;
      }
    }
  }

  return { count, lastEventDate };
}
