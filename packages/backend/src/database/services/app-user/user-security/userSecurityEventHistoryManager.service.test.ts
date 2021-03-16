import { AppUserSecurityEvent } from "../../../../_common/model/app-user/AppUserSecurityEvent.type";
import {
  SECURITY_HISTORY_MAX_EVENTS_ATTEMPT,
  userSecurityEventHistoryManager,
} from "./userSecurityEventHistoryManager.service";

describe("userSecurityEventHistoryManager", () => {
  it("findOneByTokenAttribute returns matching user", async () => {
    let eventsHistory: AppUserSecurityEvent[] = [];

    expect(
      userSecurityEventHistoryManager.isAccountLockedForOperation({
        eventsHistory,
        userId: 1,
        operation: "login",
      })
    ).toBeFalsy();

    for (let i = 0; i < SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 1; i++) {
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
});
