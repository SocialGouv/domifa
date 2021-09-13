import {
  UserStructureSecurity,
  UserStructureSecurityEventType,
} from "../../../../_common/model";
import { UserStructureSecurityTable } from "../../../entities/user-structure/UserStructureSecurityTable.typeorm";
import { pgRepository } from "../../_postgres";
import { userSecurityEventHistoryManager } from "./userSecurityEventHistoryManager.service";

const baseRepository = pgRepository.get<
  UserStructureSecurityTable,
  UserStructureSecurity
>(UserStructureSecurityTable);

export const userSecurityRepository = {
  ...baseRepository,
  findOneByTokenAttribute,
  logEvent,
};

function findOneByTokenAttribute(
  tokenValue: string
): Promise<
  Pick<
    UserStructureSecurity,
    "uuid" | "userId" | "temporaryTokens" | "eventsHistory"
  >
> {
  return baseRepository.findOneWithQuery({
    select: ["uuid", "userId", "temporaryTokens", "eventsHistory"],
    where: `"temporaryTokens"->>'token' = :tokenValue`,
    params: {
      tokenValue,
    },
  });
}
function logEvent({
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
  const eventsHistory = userSecurityEventHistoryManager.updateEventHistory({
    eventType,
    eventsHistory: userSecurity.eventsHistory,
    clearAllEvents,
  });
  return userSecurityRepository.updateOne(
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
