import { UserSecurity, UserSecurityEventType } from "../../../_common/model";
import { userSecurityEventHistoryManager } from "../../../modules/users/services";
import { UserStructureSecurityTable } from "../../entities";
import { joinSelectFields, myDataSource } from "../_postgres";

export const userStructureSecurityRepository = myDataSource
  .getRepository(UserStructureSecurityTable)
  .extend({
    async findOneByTokenAttribute(
      tokenValue: string
    ): Promise<
      Pick<
        UserSecurity,
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
      userSecurity: UserSecurity;
      eventType: UserSecurityEventType;
      attributes?: Partial<UserSecurity>;
      clearAllEvents?: boolean;
    }) {
      const eventsHistory = userSecurityEventHistoryManager.updateEventHistory({
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
