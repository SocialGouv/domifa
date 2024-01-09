import { Structure } from "@domifa/common";

import { StructureTable } from "../../entities";
import { joinSelectFields, myDataSource, pgRepository } from "../_postgres";

const baseRepository = pgRepository.get<StructureTable, Structure>(
  StructureTable
);

export const structureRepository = myDataSource
  .getRepository<Structure>(StructureTable)
  .extend({
    countBy: baseRepository.countBy,
    async checkHardResetToken({
      userId,
      token,
    }: {
      userId: number;
      token: string;
    }): Promise<Pick<Structure, "hardReset" | "id" | "uuid">> {
      const select = ["hardReset", "id", "uuid"];

      return this.createQueryBuilder()
        .select(joinSelectFields(select))
        .where(`"hardReset" @> :hardReset`, {
          hardReset: JSON.stringify({ token, userId }),
        })
        .getRawOne();
    },
  });
