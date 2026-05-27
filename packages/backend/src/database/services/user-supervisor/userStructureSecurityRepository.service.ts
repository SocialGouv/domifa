import { UserSecurity } from "../../../_common/model";
import { UserSupervisorSecurityTable } from "../../entities/user-supervisor";
import { myDataSource } from "../_postgres";

export const userSupervisorSecurityRepository = myDataSource
  .getRepository(UserSupervisorSecurityTable)
  .extend({
    async findOneByTokenAttribute(
      tokenValue: string
    ): Promise<Pick<
      UserSecurity,
      "uuid" | "userId" | "temporaryTokens"
    > | null> {
      const rows = (await this.query(
        `SELECT uuid, "userId", "temporaryTokens"
         FROM user_supervisor_security
         WHERE "temporaryTokens"->>'token' = $1
         LIMIT 1`,
        [tokenValue]
      )) as Array<Pick<UserSecurity, "uuid" | "userId" | "temporaryTokens">>;
      return rows[0] ?? null;
    },
  });
