import { subDays, subWeeks } from "date-fns";

import { domifaConfig } from "../../../../config";
import { appLogger } from "../../../../util";
import { UserStructureSecurityEventType } from "../../../../_common/model";
import { UserStructureSecurityEvent } from "../../../../_common/model/user-structure/UserStructureSecurityEvent.type";

export const STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT = 5;

export const userStructureSecurityEventHistoryManager = {
  updateEventHistory,
  isAccountLockedForOperation,
};

function updateEventHistory({
  eventType,
  eventsHistory,
  clearAllEvents,
}: {
  eventType: UserStructureSecurityEventType;
  eventsHistory: UserStructureSecurityEvent[];
  clearAllEvents?: boolean;
}): UserStructureSecurityEvent[] {
  const event: UserStructureSecurityEvent = {
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
  operation:
    | "login"
    | "validate-account"
    | "reset-password-request"
    | "reset-password-confirm"
    | "change-password";
  eventsHistory: UserStructureSecurityEvent[];
  userId: number;
}) {
  const oneDayAgo = subDays(new Date(), 1);
  const eventsRecentHistory = eventsHistory.filter(
    (x) => new Date(x.date) > oneDayAgo
  );

  if (eventsHistory.length) {
    if (
      eventsHistory[eventsHistory.length - 1].type ===
        "change-password-success" ||
      eventsHistory[eventsHistory.length - 1].type === "reset-password-success"
    ) {
      return false;
    }
  }

  if (
    eventsRecentHistory.length >= STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT
  ) {
    if (operation === "login") {
      const count = eventsRecentHistory.filter(
        (x) => x.type === "login-error"
      ).length;
      if (count >= STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT) {
        logOperationError({ operation, userId });
        return true;
      }
    } else if (operation === "change-password") {
      const count = eventsRecentHistory.filter(
        (x) => x.type === "change-password-error"
      ).length;
      if (count >= STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT) {
        logOperationError({ operation, userId });
        return true;
      }
    } else if (operation === "reset-password-request") {
      const count = eventsRecentHistory.filter(
        (x) => x.type === "reset-password-request"
      ).length;
      if (count >= STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT) {
        logOperationError({ operation, userId });
        return true;
      }
    } else if (operation === "reset-password-confirm") {
      const count = eventsRecentHistory.filter(
        (x) => x.type === "reset-password-error"
      ).length;
      if (count >= STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT) {
        logOperationError({ operation, userId });
        return true;
      }
    } else if (operation === "validate-account") {
      const count = eventsRecentHistory.filter(
        (x) => x.type === "validate-account-error"
      ).length;
      if (count >= STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT) {
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
