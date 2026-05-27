import { Raw } from "typeorm";

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
      return this.findOne({
        where: {
          temporaryTokens: Raw((alias) => `${alias}->>'token' = :token`, {
            token: tokenValue,
          }),
        },
        select: { uuid: true, userId: true, temporaryTokens: true },
      });
    },
  });
