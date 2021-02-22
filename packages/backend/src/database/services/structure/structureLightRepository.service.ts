import moment = require("moment");
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
  exportDateUTC,
}: {
  exportDateUTC: Date;
}): Promise<StructureLight[]> {
  const structures: StructureLight[] = await baseRepository.findManyWithQuery({
    alias: "s",
    where: `not exists(select 1 from structure_stats ss where ss."structureId"=s.id and ss."date"=(:exportDateUTC::"date"))`,
    params: {
      exportDateUTC: moment(exportDateUTC, "YYYY-MM-DD"),
    },
    logSql: false,
  });
  return structures;
}
