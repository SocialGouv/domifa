import { subHours, subMinutes } from "date-fns";
import { UserSecurityEvent } from "../../../../_common/model";
import {
  userSecurityEventHistoryManager,
  STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT,
  getBackoffTime,
} from "../userSecurityEventHistoryManager.service";

describe("userSecurityEventHistoryManager", () => {
  it("findOneByTokenAttribute returns matching user", async () => {
    let eventsHistory: UserSecurityEvent[] = [];

    expect(
      userSecurityEventHistoryManager.isAccountLockedForOperation({
        eventsHistory,
        userId: 1,
        operation: "login",
      })
    ).toBeFalsy();

    for (
      let i = 0;
      i < STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 1;
      i++
    ) {
      // log many login errors
      eventsHistory = userSecurityEventHistoryManager.updateEventHistory({
        eventType: "login-error",
        eventsHistory,
      });
    }
    // account still not locked
    expect(
      userSecurityEventHistoryManager.isAccountLockedForOperation({
        eventsHistory,
        userId: 1,
        operation: "login",
      })
    ).toBeFalsy();
    // log last error to lock account
    eventsHistory = userSecurityEventHistoryManager.updateEventHistory({
      eventType: "login-error",
      eventsHistory,
    });
    expect(
      userSecurityEventHistoryManager.isAccountLockedForOperation({
        eventsHistory,
        userId: 1,
        operation: "login",
      })
    ).toBeTruthy();
  });

  describe(".getBackoffTime", () => {
    it("should return null when events history is empty", () => {
      const eventsHistory: UserSecurityEvent[] = [];
      const result = getBackoffTime(eventsHistory);
      expect(result).toBeNull();
    });

    it("should return null when no events in the last hour", () => {
      const eventsHistory: UserSecurityEvent[] = [
        {
          type: "login-error",
          date: subHours(new Date(), 2), // 2 hours ago
        },
        {
          type: "login-error",
          date: subHours(new Date(), 3), // 3 hours ago
        },
      ];
      const result = getBackoffTime(eventsHistory);
      expect(result).toBeNull();
    });

    it("should return null when last event is change-password-success", () => {
      const now = new Date();
      const eventsHistory: UserSecurityEvent[] = [
        {
          type: "login-error",
          date: subMinutes(now, 30),
        },
        {
          type: "login-error",
          date: subMinutes(now, 20),
        },
        {
          type: "change-password-success",
          date: subMinutes(now, 10),
        },
      ];
      const result = getBackoffTime(eventsHistory);
      expect(result).toBeNull();
    });

    it("should return null when last event is reset-password-success", () => {
      const now = new Date();
      const eventsHistory: UserSecurityEvent[] = [
        {
          type: "login-error",
          date: subMinutes(now, 30),
        },
        {
          type: "login-error",
          date: subMinutes(now, 20),
        },
        {
          type: "reset-password-success",
          date: subMinutes(now, 10),
        },
      ];
      const result = getBackoffTime(eventsHistory);
      expect(result).toBeNull();
    });

    it("should return null when fewer than max attempts for any event type", () => {
      const now = new Date();
      const eventsHistory: UserSecurityEvent[] = [];

      // Add 4 login errors (less than max of 5)
      for (
        let i = 0;
        i < STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 1;
        i++
      ) {
        eventsHistory.push({
          type: "login-error",
          date: subMinutes(now, i * 5),
        });
      }

      const result = getBackoffTime(eventsHistory);
      expect(result).toBeNull();
    });

    it("should return backoff time when max attempts reached for login-error", () => {
      const now = new Date();
      const lastEventDate = subMinutes(now, 10);
      const eventsHistory: UserSecurityEvent[] = [];

      // Add exactly max attempts for login errors
      for (let i = 0; i < STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT; i++) {
        eventsHistory.push({
          type: "login-error",
          date:
            i === STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 1
              ? lastEventDate
              : subMinutes(now, (i + 1) * 5),
        });
      }

      const result = getBackoffTime(eventsHistory);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(60); // Should be within 1 hour
    });

    it("should return backoff time when max attempts reached for validate-account-error", () => {
      const now = new Date();
      const lastEventDate = subMinutes(now, 15);
      const eventsHistory: UserSecurityEvent[] = [];

      // Add exactly max attempts for validate account errors
      for (let i = 0; i < STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT; i++) {
        eventsHistory.push({
          type: "validate-account-error",
          date:
            i === STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 1
              ? lastEventDate
              : subMinutes(now, (i + 1) * 3),
        });
      }

      const result = getBackoffTime(eventsHistory);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(60);
    });

    it("should return backoff time when max attempts reached for reset-password-error", () => {
      const now = new Date();
      const lastEventDate = subMinutes(now, 20);
      const eventsHistory: UserSecurityEvent[] = [];

      // Add exactly max attempts for reset password errors
      for (let i = 0; i < STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT; i++) {
        eventsHistory.push({
          type: "reset-password-error",
          date:
            i === STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 1
              ? lastEventDate
              : subMinutes(now, (i + 1) * 4),
        });
      }

      const result = getBackoffTime(eventsHistory);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(60);
    });

    it("should return backoff time when max attempts reached for change-password-error", () => {
      const now = new Date();
      const lastEventDate = subMinutes(now, 25);
      const eventsHistory: UserSecurityEvent[] = [];

      // Add exactly max attempts for change password errors
      for (let i = 0; i < STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT; i++) {
        eventsHistory.push({
          type: "change-password-error",
          date:
            i === STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 1
              ? lastEventDate
              : subMinutes(now, (i + 1) * 2),
        });
      }

      const result = getBackoffTime(eventsHistory);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(60);
    });

    it("should return null when blocking period has expired", () => {
      const now = new Date();
      const lastEventDate = subHours(now, 1.5); // 1.5 hours ago
      const eventsHistory: UserSecurityEvent[] = [];

      // Add max attempts but with last event more than 1 hour ago
      for (let i = 0; i < STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT; i++) {
        eventsHistory.push({
          type: "login-error",
          date:
            i === STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 1
              ? lastEventDate
              : subHours(now, 2 + i * 0.1),
        });
      }

      const result = getBackoffTime(eventsHistory);
      expect(result).toBeNull();
    });

    it("should not count success events in the event history map", () => {
      const now = new Date();
      const eventsHistory: UserSecurityEvent[] = [];

      // Add success events (should not count towards blocking)
      eventsHistory.push({
        type: "login-success",
        date: subMinutes(now, 50),
      });
      eventsHistory.push({
        type: "validate-account-success",
        date: subMinutes(now, 40),
      });

      // Add fewer than max error events
      for (
        let i = 0;
        i < STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 1;
        i++
      ) {
        eventsHistory.push({
          type: "login-error",
          date: subMinutes(now, i * 5),
        });
      }

      const result = getBackoffTime(eventsHistory);
      expect(result).toBeNull();
    });

    it("should handle mixed event types and only block when one type reaches max", () => {
      const now = new Date();
      const lastEventDate = subMinutes(now, 5);
      const eventsHistory: UserSecurityEvent[] = [];

      // Add 3 login errors
      for (let i = 0; i < 3; i++) {
        eventsHistory.push({
          type: "login-error",
          date: subMinutes(now, 50 - i * 10),
        });
      }

      // Add max attempts for validate-account-error
      for (let i = 0; i < STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT; i++) {
        eventsHistory.push({
          type: "validate-account-error",
          date:
            i === STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 1
              ? lastEventDate
              : subMinutes(now, (i + 1) * 3),
        });
      }

      const result = getBackoffTime(eventsHistory);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(60);
    });

    it("should calculate correct remaining time", () => {
      const now = new Date();
      const lastEventDate = subMinutes(now, 30); // 30 minutes ago
      const eventsHistory: UserSecurityEvent[] = [];

      // Add max attempts with last event 30 minutes ago
      for (let i = 0; i < STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT; i++) {
        eventsHistory.push({
          type: "login-error",
          date:
            i === STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 1
              ? lastEventDate
              : subMinutes(now, 35 + i),
        });
      }

      const result = getBackoffTime(eventsHistory);
      expect(result).toBeGreaterThan(25); // Should be around 30 minutes remaining
      expect(result).toBeLessThanOrEqual(35);
    });

    it("should only consider events from the last hour for counting", () => {
      const now = new Date();
      const lastEventDate = subMinutes(now, 10);
      const eventsHistory: UserSecurityEvent[] = [];

      // Add old events (more than 1 hour ago) - should not count
      for (let i = 0; i < STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT; i++) {
        eventsHistory.push({
          type: "login-error",
          date: subHours(now, 2),
        });
      }

      // Add recent events (less than max)
      for (
        let i = 0;
        i < STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 1;
        i++
      ) {
        eventsHistory.push({
          type: "login-error",
          date:
            i === STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 2
              ? lastEventDate
              : subMinutes(now, (i + 1) * 5),
        });
      }

      const result = getBackoffTime(eventsHistory);
      expect(result).toBeNull();
    });
  });
});
