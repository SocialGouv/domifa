import {
  UserUsagerSecurity,
  UserUsagerSecurityEventType,
} from "../../../../_common/model";
import { UserUsagerSecurityTable } from "../../../entities/user-usager/UserUsagerSecurityTable.typeorm";
import { pgRepository } from "../../_postgres";
import { userUsagerSecurityEventHistoryManager } from "./userUsagerSecurityEventHistoryManager.service";

const baseRepository = pgRepository.get<
  UserUsagerSecurityTable,
  UserUsagerSecurity
>(UserUsagerSecurityTable);

export const userUsagerSecurityRepository = {
  ...baseRepository,
  logEvent,
};

function logEvent({
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
  return userUsagerSecurityRepository.updateOne(
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
