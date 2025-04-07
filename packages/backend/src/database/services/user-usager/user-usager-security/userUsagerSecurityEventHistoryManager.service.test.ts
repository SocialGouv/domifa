import { UserUsagerSecurityEvent } from "../../../../_common/model/users/user-usager/UserUsagerSecurityEvent.type";
import {
  USAGER_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT,
  userUsagerSecurityEventHistoryManager,
} from "./userUsagerSecurityEventHistoryManager.service";

describe("userUsagerSecurityEventHistoryManager", () => {
  it("findOneByTokenAttribute returns matching user", async () => {
    let eventsHistory: UserUsagerSecurityEvent[] = [];

    expect(
      userUsagerSecurityEventHistoryManager.isAccountLockedForOperation({
        eventsHistory,
        userId: 1,
        operation: "login",
      })
    ).toBeFalsy();

    for (let i = 0; i < USAGER_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT - 1; i++) {
      // log many login errors
      eventsHistory = userUsagerSecurityEventHistoryManager.updateEventHistory({
        eventType: "login-error",
        eventsHistory,
      });
    }
    // account still not locked
    expect(
      userUsagerSecurityEventHistoryManager.isAccountLockedForOperation({
        eventsHistory,
        userId: 1,
        operation: "login",
      })
    ).toBeFalsy();
    // log last error to lock account
    eventsHistory = userUsagerSecurityEventHistoryManager.updateEventHistory({
      eventType: "login-error",
      eventsHistory,
    });
    expect(
      userUsagerSecurityEventHistoryManager.isAccountLockedForOperation({
        eventsHistory,
        userId: 1,
        operation: "login",
      })
    ).toBeTruthy();
  });
});
