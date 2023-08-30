import {
  Structure,
  StructureCommon,
  STRUCTURE_COMMON_ATTRIBUTES,
} from "../../../_common/model";
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
    }): Promise<StructureCommon & Pick<Structure, "hardReset">> {
      const select: (keyof StructureCommon & Pick<Structure, "hardReset">)[] = (
        STRUCTURE_COMMON_ATTRIBUTES as any[]
      ).concat(["hardReset"]);

      return this.createQueryBuilder()
        .select(joinSelectFields(select))
        .where(`"hardReset" @> :hardReset`, {
          hardReset: JSON.stringify({ token, userId }),
        })
        .getRawOne();
    },
  });
