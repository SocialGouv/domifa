import { UserSecurity } from "../../../_common/model";
import { UserSupervisorSecurityTable } from "../../entities/user-supervisor";
import { myDataSource } from "../_postgres";

export const userSupervisorSecurityRepository = myDataSource
  .getRepository(UserSupervisorSecurityTable)
  .extend({
    // See sibling user_structure_security repo — TypeORM's `Raw` helper drops
    // the alias quoting on JSONB operators, so we fall back to a paramaterised
    // raw query.
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
