import moment = require("moment");
import { domifaConfig } from "../../../../config";
import { appLogger } from "../../../../util";
import { AppUserSecurityEventType } from "../../../../_common/model";
import { AppUserSecurityEvent } from "../../../../_common/model/app-user/AppUserSecurityEvent.type";

export const SECURITY_HISTORY_MAX_EVENTS_ATTEMPT = 5;

export const userSecurityEventHistoryManager = {
  updateEventHistory,
  isAccountLockedForOperation,
};

function updateEventHistory({
  eventType,
  eventsHistory,
  clearAllEvents,
}: {
  eventType: AppUserSecurityEventType;
  eventsHistory: AppUserSecurityEvent[];
  clearAllEvents?: boolean;
}): AppUserSecurityEvent[] {
  const event: AppUserSecurityEvent = {
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
  eventsHistory: AppUserSecurityEvent[];
  userId: number;
}) {
  const oneDayAgo = moment().add(-1, "day").toDate();
  const eventsRecentHistory = eventsHistory.filter(
    (x) => new Date(x.date) > oneDayAgo
  );
  if (eventsRecentHistory.length >= SECURITY_HISTORY_MAX_EVENTS_ATTEMPT) {
    if (operation === "login") {
      const count = eventsRecentHistory.filter(
        (x) => x.type === "login-error"
      ).length;
      if (count >= SECURITY_HISTORY_MAX_EVENTS_ATTEMPT) {
        logOperationError({ operation, userId });
        return true;
      }
    } else if (operation === "change-password") {
      const count = eventsRecentHistory.filter(
        (x) => x.type === "change-password-error"
      ).length;
      if (count >= SECURITY_HISTORY_MAX_EVENTS_ATTEMPT) {
        logOperationError({ operation, userId });
        return true;
      }
    } else if (operation === "reset-password-request") {
      const count = eventsRecentHistory.filter(
        (x) => x.type === "reset-password-request"
      ).length;
      if (count >= SECURITY_HISTORY_MAX_EVENTS_ATTEMPT) {
        logOperationError({ operation, userId });
        return true;
      }
    } else if (operation === "reset-password-confirm") {
      const count = eventsRecentHistory.filter(
        (x) => x.type === "reset-password-error"
      ).length;
      if (count >= SECURITY_HISTORY_MAX_EVENTS_ATTEMPT) {
        logOperationError({ operation, userId });
        return true;
      }
    } else if (operation === "validate-account") {
      const count = eventsRecentHistory.filter(
        (x) => x.type === "validate-account-error"
      ).length;
      if (count >= SECURITY_HISTORY_MAX_EVENTS_ATTEMPT) {
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
  if (domifaConfig().envId === "dev") {
    appLogger.warn(
      "Operation forbidden due to excessive recent security events",
      {
        sentryBreadcrumb: false,
        extra: {
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
        extra: {
          operation,
          userId,
        },
      }
    );
  }
}
