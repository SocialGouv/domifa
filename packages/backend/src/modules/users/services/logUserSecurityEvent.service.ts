import {
  UserProfile,
  UserSecurity,
  UserSecurityEventType,
} from "../../../_common/model";
import { getUserSecurityRepository } from "./get-user-repository.service";
import { userSecurityEventHistoryManager } from "./userSecurityEventHistoryManager.service";

export const logUserSecurityEvent = async ({
  userProfile,
  userId,
  userSecurity,
  eventType,
  attributes,
  clearAllEvents,
}: {
  userProfile: UserProfile;
  userId: number;
  userSecurity: UserSecurity;
  eventType: UserSecurityEventType;
  attributes?: Partial<UserSecurity>;
  clearAllEvents?: boolean;
}) => {
  const securityRepository = getUserSecurityRepository(userProfile);

  const eventsHistory = userSecurityEventHistoryManager.updateEventHistory({
    eventType,
    eventsHistory: userSecurity.eventsHistory,
    clearAllEvents,
  });
  return securityRepository.update(
    {
      userId,
    },
    attributes
      ? {
          eventsHistory,
          ...attributes,
        }
      : {
          eventsHistory,
        }
  );
};
