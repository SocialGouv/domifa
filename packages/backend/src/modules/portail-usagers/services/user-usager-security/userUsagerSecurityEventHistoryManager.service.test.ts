import { UserSecurityEvent } from "../../../../_common/model";
import {
  SECURITY_HISTORY_MAX_EVENTS_ATTEMPT,
  userSecurityEventHistoryManager,
  userStatusManager,
} from "../../../users/services";

describe("userUsagerSecurityEventHistoryManager", () => {
  beforeEach(() => {
    jest
      .spyOn(userStatusManager, "markUserAsTemporarilyBlocked")
      .mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("triggers TEMPORARILY_BLOCKED for the usager profile after enough recent errors", async () => {
    let eventsHistory: UserSecurityEvent[] = [];

    expect(
      await userSecurityEventHistoryManager.isAccountLockedForOperation({
        eventsHistory,
        userId: 1,
        operation: "login",
        userProfile: "usager",
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
        userProfile: "usager",
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
        userProfile: "usager",
      })
    ).toBeTruthy();
    expect(userStatusManager.markUserAsTemporarilyBlocked).toHaveBeenCalledWith(
      {
        userProfile: "usager",
        userId: 1,
      }
    );
  });
});
