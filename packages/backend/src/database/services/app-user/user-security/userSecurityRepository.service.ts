import {
  AppUserSecurity,
  AppUserSecurityEventType,
} from "../../../../_common/model";
import { AppUserSecurityTable } from "../../../entities/app-user/AppUserSecurityTable.typeorm";
import { pgRepository } from "../../_postgres";
import { userSecurityEventHistoryManager } from "./userSecurityEventHistoryManager.service";

const baseRepository = pgRepository.get<AppUserSecurityTable, AppUserSecurity>(
  AppUserSecurityTable
);

export const userSecurityRepository = {
  ...baseRepository,
  findOneByTokenAttribute,
  logEvent,
};

function findOneByTokenAttribute(
  tokenValue: string
): Promise<
  Pick<AppUserSecurity, "uuid" | "userId" | "temporaryTokens" | "eventsHistory">
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
}: {
  userId: number;
  userSecurity: AppUserSecurity;
  eventType: AppUserSecurityEventType;
  attributes?: Partial<AppUserSecurity>;
}) {
  attributes = attributes
    ? {
        eventsHistory: userSecurityEventHistoryManager.updateEventHistory({
          eventType,
          eventsHistory: userSecurity.eventsHistory,
        }),
        ...attributes,
      }
    : {
        eventsHistory: userSecurityEventHistoryManager.updateEventHistory({
          eventType,
          eventsHistory: userSecurity.eventsHistory,
        }),
      };
  return userSecurityRepository.updateOne(
    {
      userId,
    },
    attributes
  );
}
