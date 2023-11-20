import { UserUsagerLoginTable } from "../../entities";
import { myDataSource } from "../_postgres";

export const userUsagerLoginRepository = myDataSource
  .getRepository(UserUsagerLoginTable)
  .extend({
    async totalLoginAllUsagersStructure(structureId: number): Promise<
      | {
          usagerUUID: string;
          total: string;
        }[]
      | null
    > {
      return await userUsagerLoginRepository.query(
        `SELECT u."usagerUUID", COUNT(uuid) AS "total" FROM user_usager_login u WHERE u."structureId" = $1 GROUP BY u."usagerUUID"`,
        [structureId]
      );
    },
  });
