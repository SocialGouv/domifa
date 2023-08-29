import {
  UserStructureSecurity,
  UserStructureSecurityEventType,
} from "../../../../_common/model";
import { UserStructureSecurityTable } from "../../../entities/user-structure/UserStructureSecurityTable.typeorm";
import { myDataSource } from "../../_postgres";
import { userStructureSecurityEventHistoryManager } from "./userStructureSecurityEventHistoryManager.service";

export const userStructureSecurityRepository = myDataSource
  .getRepository(UserStructureSecurityTable)
  .extend({
    findOneByTokenAttribute,
    logEvent,
  });

async function findOneByTokenAttribute(
  tokenValue: string
): Promise<
  Pick<
    UserStructureSecurity,
    "uuid" | "userId" | "temporaryTokens" | "eventsHistory"
  >
> {
  return myDataSource
    .getRepository(UserStructureSecurityTable)
    .createQueryBuilder("user_structure_security")
    .where(`"temporaryTokens"->>'token' = :tokenValue`, {
      tokenValue,
    })
    .select(["uuid", "userId", "temporaryTokens", "eventsHistory"])
    .getRawOne();
}
async function logEvent({
  userId,
  userSecurity,
  eventType,
  attributes,
  clearAllEvents,
}: {
  userId: number;
  userSecurity: UserStructureSecurity;
  eventType: UserStructureSecurityEventType;
  attributes?: Partial<UserStructureSecurity>;
  clearAllEvents?: boolean;
}) {
  const eventsHistory =
    userStructureSecurityEventHistoryManager.updateEventHistory({
      eventType,
      eventsHistory: userSecurity.eventsHistory,
      clearAllEvents,
    });

  return myDataSource.getRepository(UserStructureSecurityTable).update(
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
