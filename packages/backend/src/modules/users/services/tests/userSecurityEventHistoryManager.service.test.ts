import { subHours, subMinutes } from "date-fns";
import { UserSecurityEvent } from "../../../../_common/model";
import {
  userSecurityEventHistoryManager,
  SECURITY_HISTORY_MAX_EVENTS_ATTEMPT,
  getBackoffTime,
} from "../userSecurityEventHistoryManager.service";
import { userStatusManager } from "../userStatusManager.service";

describe("userSecurityEventHistoryManager", () => {
  beforeEach(() => {
    jest
      .spyOn(userStatusManager, "markUserAsTemporarilyBlocked")
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("isAccountLockedForOperation triggers TEMPORARILY_BLOCKED on threshold", async () => {
    let eventsHistory: UserSecurityEvent[] = [];

    expect(
      await userSecurityEventHistoryManager.isAccountLockedForOperation({
        eventsHistory,
        userId: 1,
        operation: "login",
      })
    ).toBeFalsy();

    for (let i = 0; i < SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 1; i++) {
      eventsHistory = userSecurityEventHistoryManager.updateEventHistory({
        eventType: "login-error",
        eventsHistory,
      });
    }
    expect(
      await userSecurityEventHistoryManager.isAccountLockedForOperation({
        eventsHistory,
        userId: 1,
        operation: "login",
      })
    ).toBeFalsy();
    expect(
      userStatusManager.markUserAsTemporarilyBlocked
    ).not.toHaveBeenCalled();

    eventsHistory = userSecurityEventHistoryManager.updateEventHistory({
      eventType: "login-error",
      eventsHistory,
    });
    expect(
      await userSecurityEventHistoryManager.isAccountLockedForOperation({
        eventsHistory,
        userId: 1,
        operation: "login",
      })
    ).toBeTruthy();
    expect(userStatusManager.markUserAsTemporarilyBlocked).toHaveBeenCalledWith(
      {
        userProfile: "structure",
        userId: 1,
      }
    );
  });

  describe(".getBackoffTime", () => {
    it("returns null when events history is empty", () => {
      expect(getBackoffTime([])).toBeNull();
    });

    it("returns null when no events in the last hour", () => {
      const eventsHistory: UserSecurityEvent[] = [
        { type: "login-error", date: subHours(new Date(), 2) },
        { type: "login-error", date: subHours(new Date(), 3) },
      ];
      expect(getBackoffTime(eventsHistory)).toBeNull();
    });

    it("returns null when last event is change-password-success", () => {
      const now = new Date();
      const eventsHistory: UserSecurityEvent[] = [
        { type: "login-error", date: subMinutes(now, 30) },
        { type: "login-error", date: subMinutes(now, 20) },
        { type: "change-password-success", date: subMinutes(now, 10) },
      ];
      expect(getBackoffTime(eventsHistory)).toBeNull();
    });

    it("returns null when last event is reset-password-success", () => {
      const now = new Date();
      const eventsHistory: UserSecurityEvent[] = [
        { type: "login-error", date: subMinutes(now, 30) },
        { type: "login-error", date: subMinutes(now, 20) },
        { type: "reset-password-success", date: subMinutes(now, 10) },
      ];
      expect(getBackoffTime(eventsHistory)).toBeNull();
    });

    it("returns null when fewer than max attempts for any event type", () => {
      const now = new Date();
      const eventsHistory: UserSecurityEvent[] = [];
      for (let i = 0; i < SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 1; i++) {
        eventsHistory.push({
          type: "login-error",
          date: subMinutes(now, i * 5),
        });
      }
      expect(getBackoffTime(eventsHistory)).toBeNull();
    });

    it.each([
      "login-error",
      "validate-account-error",
      "reset-password-error",
      "change-password-error",
    ] as const)(
      "returns minutes remaining when threshold reached for %s",
      (eventType) => {
        const now = new Date();
        const lastEventDate = subMinutes(now, 10);
        const eventsHistory: UserSecurityEvent[] = [];
        for (let i = 0; i < SECURITY_HISTORY_MAX_EVENTS_ATTEMPT; i++) {
          eventsHistory.push({
            type: eventType,
            date:
              i === SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 1
                ? lastEventDate
                : subMinutes(now, (i + 1) * 5),
          });
        }
        const result = getBackoffTime(eventsHistory);
        expect(result).toBeGreaterThan(0);
        expect(result).toBeLessThanOrEqual(60);
      }
    );

    it("returns null when blocking period has expired", () => {
      const now = new Date();
      const lastEventDate = subHours(now, 1.5); // 1.5 hours ago
      const eventsHistory: UserSecurityEvent[] = [];

      for (let i = 0; i < SECURITY_HISTORY_MAX_EVENTS_ATTEMPT; i++) {
        eventsHistory.push({
          type: "login-error",
          date:
            i === SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 1
              ? lastEventDate
              : subHours(now, 2 + i * 0.1),
        });
      }

      expect(getBackoffTime(eventsHistory)).toBeNull();
    });

    it("does not count success events in the recent error map", () => {
      const now = new Date();
      const eventsHistory: UserSecurityEvent[] = [
        { type: "login-success", date: subMinutes(now, 50) },
        { type: "validate-account-success", date: subMinutes(now, 40) },
      ];
      for (let i = 0; i < SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 1; i++) {
        eventsHistory.push({
          type: "login-error",
          date: subMinutes(now, i * 5),
        });
      }
      expect(getBackoffTime(eventsHistory)).toBeNull();
    });

    it("only counts events from the last hour", () => {
      const now = new Date();
      const eventsHistory: UserSecurityEvent[] = [];
      for (let i = 0; i < SECURITY_HISTORY_MAX_EVENTS_ATTEMPT; i++) {
        eventsHistory.push({ type: "login-error", date: subHours(now, 2) });
      }
      for (let i = 0; i < SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 1; i++) {
        eventsHistory.push({
          type: "login-error",
          date: subMinutes(now, (i + 1) * 5),
        });
      }
      expect(getBackoffTime(eventsHistory)).toBeNull();
    });
  });
});
