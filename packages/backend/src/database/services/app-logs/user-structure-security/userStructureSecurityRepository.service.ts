import {
  UserStructureSecurity,
  UserStructureSecurityEventType,
} from "../../../../_common/model";
import { UserStructureSecurityTable } from "../../../entities/user-structure/UserStructureSecurityTable.typeorm";
import { myDataSource, pgRepository } from "../../_postgres";
import { userStructureSecurityEventHistoryManager } from "./userStructureSecurityEventHistoryManager.service";

const baseRepository = pgRepository.get<
  UserStructureSecurityTable,
  UserStructureSecurity
>(UserStructureSecurityTable);

export const UserStructureSecurityRepository = myDataSource
  .getRepository(UserStructureSecurityTable)
  .extend({
    findOneByTokenAttribute(
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
    },
    logEvent({
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
    },
  });
