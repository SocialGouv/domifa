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
  statsDateUTC,
}: {
  statsDateUTC: Date;
}): Promise<StructureLight[]> {
  const statsDateUTCString = moment.utc(statsDateUTC).format("YYYY-MM-DD");
  const structures: StructureLight[] = await baseRepository.findManyWithQuery({
    alias: "s",
    where: `not exists(select 1 from structure_stats ss where ss."structureId"=s.id and ss."date"=(:statsDateUTCString::"date"))`,
    params: {
      statsDateUTCString,
    },
    logSql: false,
  });
  return structures;
}
