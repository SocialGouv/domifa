import {
  UserUsagerSecurity,
  UserUsagerSecurityEventType,
} from "../../../../_common/model";
import { UserUsagerSecurityTable } from "../../../entities/user-usager/UserUsagerSecurityTable.typeorm";
import { myDataSource } from "../../_postgres";
import { userUsagerSecurityEventHistoryManager } from "./userUsagerSecurityEventHistoryManager.service";

export const userUsagerSecurityRepository = myDataSource
  .getRepository(UserUsagerSecurityTable)
  .extend({ logEvent });

async function logEvent({
  userId,
  userSecurity,
  eventType,
  attributes,
  clearAllEvents,
}: {
  userId: number;
  userSecurity: UserUsagerSecurity;
  eventType: UserUsagerSecurityEventType;
  attributes?: Partial<UserUsagerSecurity>;
  clearAllEvents?: boolean;
}) {
  const eventsHistory =
    userUsagerSecurityEventHistoryManager.updateEventHistory({
      eventType,
      eventsHistory: userSecurity.eventsHistory,
      clearAllEvents,
    });
  return userUsagerSecurityRepository.update(
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
}
