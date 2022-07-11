import moment = require("moment");
import { domifaConfig } from "../../../../config";
import { appLogger } from "../../../../util";
import { UserUsagerSecurityEventType } from "../../../../_common/model";
import { UserUsagerSecurityEvent } from "../../../../_common/model/user-usager/UserUsagerSecurityEvent.type";

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
  const oneWeekAgo = moment().add(-1, "week").toDate();
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
  eventsHistory: UserUsagerSecurityEvent[];
  userId: number;
}) {
  const oneDayAgo = moment().add(-1, "day").toDate();
  const eventsRecentHistory = eventsHistory.filter(
    (x) => new Date(x.date) > oneDayAgo
  );
  if (
    eventsRecentHistory.length >= USAGER_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT
  ) {
    if (operation === "login") {
      const count = eventsRecentHistory.filter(
        (x) => x.type === "login-error"
      ).length;
      if (count >= USAGER_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT) {
        logOperationError({ operation, userId });
        return true;
      }
    } else if (operation === "change-password") {
      const count = eventsRecentHistory.filter(
        (x) => x.type === "change-password-error"
      ).length;
      if (count >= USAGER_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT) {
        logOperationError({ operation, userId });
        return true;
      }
    } else if (operation === "reset-password-request") {
      const count = eventsRecentHistory.filter(
        (x) => x.type === "reset-password-request"
      ).length;
      if (count >= USAGER_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT) {
        logOperationError({ operation, userId });
        return true;
      }
    } else if (operation === "reset-password-confirm") {
      const count = eventsRecentHistory.filter(
        (x) => x.type === "reset-password-error"
      ).length;
      if (count >= USAGER_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT) {
        logOperationError({ operation, userId });
        return true;
      }
    } else if (operation === "validate-account") {
      const count = eventsRecentHistory.filter(
        (x) => x.type === "validate-account-error"
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
