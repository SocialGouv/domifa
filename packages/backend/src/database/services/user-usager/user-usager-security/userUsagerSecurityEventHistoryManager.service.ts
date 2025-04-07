import { subHours, subWeeks } from "date-fns";

import { domifaConfig } from "../../../../config";
import { appLogger } from "../../../../util";
import { UserUsagerSecurityEventType } from "../../../../_common/model";
import { UserUsagerSecurityEvent } from "../../../../_common/model/users/user-usager/UserUsagerSecurityEvent.type";

export const USAGER_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT = 5;

export const userUsagerSecurityEventHistoryManager = {
  updateEventHistory,
  isAccountLockedForOperation,
};

function updateEventHistory({
  eventType,
  eventsHistory,
  clearAllEvents,
}: {
  eventType: UserUsagerSecurityEventType;
  eventsHistory: UserUsagerSecurityEvent[];
  clearAllEvents?: boolean;
}): UserUsagerSecurityEvent[] {
  const event: UserUsagerSecurityEvent = {
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

function isAccountLockedForOperation({
  operation,
  eventsHistory,
  userId,
}: {
  operation: "login" | "change-password";
  eventsHistory: UserUsagerSecurityEvent[];
  userId: number;
}) {
  if (eventsHistory.length) {
    if (
      eventsHistory[eventsHistory.length - 1].type ===
        "change-password-success" ||
      eventsHistory[eventsHistory.length - 1].type === "reset-password-success"
    ) {
      return false;
    }
  }

  const oneHourAgo = subHours(new Date(), 1);
  const eventsRecentHistory = eventsHistory.filter(
    (x) => new Date(x.date) > oneHourAgo
  );

  if (
    eventsRecentHistory.length >= USAGER_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT
  ) {
    if (operation === "login" || operation === "change-password") {
      const count = eventsRecentHistory.filter(
        (x) => x.type === operation + "-error"
      ).length;
      if (count >= USAGER_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT) {
        logOperationError({ operation, userId });
        return true;
      }
    }
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
  if (domifaConfig().envId === "local") {
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
