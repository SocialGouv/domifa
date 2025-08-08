import { addHours, differenceInMinutes, subHours, subWeeks } from "date-fns";

import { domifaConfig } from "../../../config";
import { appLogger } from "../../../util";
import {
  UserSecurityEventType,
  UserSecurityEvent,
  UserProfile,
  UserSecurityLogError,
} from "../../../_common/model";

export const SECURITY_HISTORY_MAX_EVENTS_ATTEMPT = 5;

export const userSecurityEventHistoryManager = {
  updateEventHistory,
  isAccountLockedForOperation,
  getBackoffTime,
};

function updateEventHistory({
  eventType,
  eventsHistory,
  clearAllEvents,
}: {
  eventType: UserSecurityEventType;
  eventsHistory: UserSecurityEvent[];
  clearAllEvents?: boolean;
}): UserSecurityEvent[] {
  const event: UserSecurityEvent = {
    type: eventType,
    date: new Date(),
  };

  if (clearAllEvents) {
    // clear all previous events
    return [event];
  }

  const oneWeekAgo = subWeeks(new Date(), 1);
  return [
    ...eventsHistory.filter((x) => {
      return new Date(x.date) > oneWeekAgo; // purge events older than one week;
    }),
    event,
  ];
}

export function getBackoffTime(
  eventsHistory: UserSecurityEvent[] | null
): number | null {
  if (!eventsHistory?.length) {
    return null;
  }

  const lastEventType = eventsHistory[eventsHistory.length - 1].type;

  if (
    lastEventType === "change-password-success" ||
    lastEventType === "reset-password-success"
  ) {
    return null;
  }

  const oneHourAgo = subHours(new Date(), 1);
  const eventsRecentHistory = eventsHistory.filter(
    (eh) =>
      new Date(eh.date) > oneHourAgo &&
      !["change-password-success", "reset-password-success"].includes(eh.type)
  );

  const eventHistoryMap = eventsRecentHistory.reduce((acc, event) => {
    acc[event.type] = (acc[event.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const lastEventDate = new Date(eventsHistory[eventsHistory.length - 1].date);

  if (
    Object.keys(eventHistoryMap).some(
      (key) => eventHistoryMap[key] >= SECURITY_HISTORY_MAX_EVENTS_ATTEMPT
    )
  ) {
    const endBlockingDate = addHours(lastEventDate, 1);
    if (endBlockingDate < new Date()) {
      return null;
    }
    return differenceInMinutes(endBlockingDate, new Date());
  }

  return null;
}

export function isAccountLockedForOperation({
  operation,
  eventsHistory,
  userId,
  userProfile = "structure", // Par défaut, pour la rétrocompatibilité
}: {
  operation: string;
  eventsHistory: UserSecurityEvent[];
  userId: number;
  userProfile?: UserProfile;
}): boolean {
  const backoffTime = getBackoffTime(eventsHistory);
  if (backoffTime !== null) {
    logOperationError({ operation, userId, userProfile });
    return true;
  }
  return false;
}

function logOperationError(context: UserSecurityLogError) {
  if (domifaConfig().envId === "dev" || domifaConfig().envId === "local") {
    appLogger.warn(
      "Operation forbidden due to excessive recent security events",
      { context }
    );
  } else if (domifaConfig().envId !== "test") {
    appLogger.error(
      "Operation forbidden due to excessive recent security events",
      {
        sentry: true,
        context,
      }
    );
  }
}
