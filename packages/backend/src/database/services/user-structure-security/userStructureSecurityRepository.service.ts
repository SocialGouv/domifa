import { UserSecurity } from "../../../_common/model";
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
  });
