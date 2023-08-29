import {
  Structure,
  StructureCommon,
  STRUCTURE_COMMON_ATTRIBUTES,
} from "../../../_common/model";
import { StructureTable } from "../../entities";
import { appTypeormManager, pgRepository } from "../_postgres";

const baseRepository = pgRepository.get<StructureTable, Structure>(
  StructureTable
);

export const structureRepository = appTypeormManager
  .getRepository<Structure>(StructureTable)
  .extend({
    countBy: baseRepository.countBy,
    findOneWithQuery: baseRepository.findOneWithQuery,
    checkHardResetToken,
  });

async function checkHardResetToken({
  userId,
  token,
}: {
  userId: number;
  token: string;
}): Promise<StructureCommon & Pick<Structure, "hardReset">> {
  const select: (keyof StructureCommon & Pick<Structure, "hardReset">)[] = (
    STRUCTURE_COMMON_ATTRIBUTES as any[]
  ).concat(["hardReset"]);

  return structureRepository.findOneWithQuery<
    StructureCommon & Pick<Structure, "hardReset">
  >({
    select,
    where: `"hardReset" @> '{"token": "${token}", "userId": ${userId}}'`,
    params: [],
  });
}
