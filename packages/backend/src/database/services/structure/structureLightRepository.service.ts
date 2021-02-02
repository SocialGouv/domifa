import {
  StructureLight,
  STRUCTURE_LIGHT_ATTRIBUTES,
} from "../../../_common/model";
import { StructureTable } from "../../entities";
import { pgRepository } from "../_postgres";

const baseRepository = pgRepository.get<StructureTable, StructureLight>(
  StructureTable,
  { defaultSelect: STRUCTURE_LIGHT_ATTRIBUTES }
);

export const structureLightRepository = {
  ...baseRepository,
  findStructuresToGenerateStats,
};

async function findStructuresToGenerateStats({
  maxLastExportDate,
}: {
  maxLastExportDate: Date;
}): Promise<StructureLight[]> {
  const structures: StructureLight[] = await baseRepository.findManyWithQuery({
    where: '"lastExport" <= :maxLastExportDate or "lastExport" IS NULL',
    params: {
      maxLastExportDate,
    },
  });
  return structures;
}
