import { addHours, differenceInMinutes, subHours, subWeeks } from "date-fns";

import { domifaConfig } from "../../../config";
import { appLogger } from "../../../util";
import {
  UserSecurityEvent,
  UserSecurityEventType,
} from "../../../_common/model";

export const STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT = 5;

export const userSecurityEventHistoryManager = {
  updateEventHistory,
  isAccountLockedForOperation,
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
  if (eventsHistory === null) return null;
  const oneHourAgo = subHours(new Date(), 1);
  const eventsRecentHistory = eventsHistory.filter(
    (eh) => new Date(eh.date) > oneHourAgo
  );

  let lastEventDate: Date | null;
  let lastEventType: UserSecurityEventType | null;
  if (eventsHistory.length) {
    lastEventDate = new Date(eventsHistory[eventsHistory.length - 1].date);
    lastEventType = eventsHistory[eventsHistory.length - 1].type;
    if (
      lastEventType === "change-password-success" ||
      lastEventType === "reset-password-success"
    ) {
      return null;
    }
  }

  const eventHistoryMap = eventsRecentHistory.reduce((acc, event) => {
    if (
      !["change-password-success", "reset-password-success"].includes(
        event.type
      )
    ) {
      acc[event.type] = (acc[event.type] || 0) + 1;
    }
    return acc;
  }, {});

  if (
    Object.keys(eventHistoryMap).some(
      (key) =>
        eventHistoryMap[key] >= STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT
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
}: {
  operation:
    | "login"
    | "validate-account"
    | "reset-password-request"
    | "reset-password-confirm"
    | "change-password";
  eventsHistory: UserSecurityEvent[];
  userId: number;
}): boolean {
  const backoffTime = getBackoffTime(eventsHistory);
  if (backoffTime !== null) {
    logOperationError({ operation, userId });
    return true;
  }
  return false;
}

function logOperationError({
  operation,
  userId,
}: {
  operation: string;
  userId: number;
}) {
  if (domifaConfig().envId === "dev" || domifaConfig().envId === "local") {
    appLogger.warn(
      "Operation forbidden due to excessive recent security events",
      {
        context: {
          operation,
          userId,
        },
      }
    );
  } else if (domifaConfig().envId !== "test") {
    appLogger.error(
      "Operation forbidden due to excessive recent security events",
      {
        sentry: true,
        context: {
          operation,
          userId,
        },
      }
    );
  }
}
