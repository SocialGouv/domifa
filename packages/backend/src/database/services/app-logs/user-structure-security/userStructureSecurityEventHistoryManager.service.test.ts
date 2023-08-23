import { UserStructureSecurityEvent } from "../../../../_common/model/user-structure/UserStructureSecurityEvent.type";
import {
  STRUCTURE_SECURITY_HISTORY_MAX_EVENTS_ATTEMPT,
  userStructureSecurityEventHistoryManager,
} from "./userStructureSecurityEventHistoryManager.service";

describe("userStructureSecurityEventHistoryManager", () => {
  it("findOneByTokenAttribute returns matching user", async () => {
    let eventsHistory: UserStructureSecurityEvent[] = [];

    expect(
      userStructureSecurityEventHistoryManager.isAccountLockedForOperation({
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
      eventsHistory =
        userStructureSecurityEventHistoryManager.updateEventHistory({
          eventType: "login-error",
          eventsHistory,
        });
    }
    // account still not locked
    expect(
      userStructureSecurityEventHistoryManager.isAccountLockedForOperation({
        eventsHistory,
        userId: 1,
        operation: "login",
      })
    ).toBeFalsy();
    // log last error to lock account
    eventsHistory = userStructureSecurityEventHistoryManager.updateEventHistory(
      {
        eventType: "login-error",
        eventsHistory,
      }
    );
    expect(
      userStructureSecurityEventHistoryManager.isAccountLockedForOperation({
        eventsHistory,
        userId: 1,
        operation: "login",
      })
    ).toBeTruthy();
  });
});
