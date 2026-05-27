import { UserSecurity } from "../../../_common/model";
import { UserStructureSecurityTable } from "../../entities";
import { myDataSource } from "../_postgres";

export const userStructureSecurityRepository = myDataSource
  .getRepository(UserStructureSecurityTable)
  .extend({
    async findOneByTokenAttribute(
      tokenValue: string
    ): Promise<Pick<
      UserSecurity,
      "uuid" | "userId" | "temporaryTokens"
    > | null> {
      const rows = (await this.query(
        `SELECT uuid, "userId", "temporaryTokens"
         FROM user_structure_security
         WHERE "temporaryTokens"->>'token' = $1
         LIMIT 1`,
        [tokenValue]
      )) as Array<Pick<UserSecurity, "uuid" | "userId" | "temporaryTokens">>;
      return rows[0] ?? null;
    },
  });
