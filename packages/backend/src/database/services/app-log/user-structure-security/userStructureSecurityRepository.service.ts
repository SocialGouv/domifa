import {
  UserStructureSecurity,
  UserStructureSecurityEventType,
} from "../../../../_common/model";
import { UserStructureSecurityTable } from "../../../entities/user-structure/UserStructureSecurityTable.typeorm";
import { joinSelectFields, myDataSource } from "../../_postgres";
import { userStructureSecurityEventHistoryManager } from "./userStructureSecurityEventHistoryManager.service";

export const userStructureSecurityRepository = myDataSource
  .getRepository(UserStructureSecurityTable)
  .extend({
    async findOneByTokenAttribute(
      tokenValue: string
    ): Promise<
      Pick<
        UserStructureSecurity,
        "uuid" | "userId" | "temporaryTokens" | "eventsHistory"
      >
    > {
      return await this.createQueryBuilder("user_structure_security")
        .where(`"temporaryTokens"->>'token' = :tokenValue`, {
          tokenValue,
        })
        .select(
          joinSelectFields([
            "uuid",
            "userId",
            "temporaryTokens",
            "eventsHistory",
          ])
        )
        .getRawOne();
    },
    async logEvent({
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

      return await this.update(
        { userId },
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
