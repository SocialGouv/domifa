import { Raw } from "typeorm";

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
