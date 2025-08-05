import { UserSecurity } from "../../../_common/model";
import { UserSupervisorSecurityTable } from "../../entities/user-supervisor";
import { joinSelectFields, myDataSource } from "../_postgres";

export const userSupervisorSecurityRepository = myDataSource
  .getRepository(UserSupervisorSecurityTable)
  .extend({
    async findOneByTokenAttribute(
      tokenValue: string
    ): Promise<
      Pick<
        UserSecurity,
        "uuid" | "userId" | "temporaryTokens" | "eventsHistory"
      >
    > {
      return await this.createQueryBuilder("user_supervisor_security")
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
  });
