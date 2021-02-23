import moment = require("moment");
import { StructureStats } from "../../../_common/model";
import { StructureStatsTable } from "../../entities";
import { pgRepository } from "../_postgres";

const STRUCTURE_STATS_ATTRIBUTES: (keyof StructureStats)[] = [
  "_id",
  "createdAt",
  "date",
  "nom",
  "structureId",
  "structureType",
  "departement",
  "ville",
  "capacite",
  "codePostal",
  "questions",
  "generated",
];
const baseRepository = pgRepository.get<StructureStatsTable, StructureStats>(
  StructureStatsTable
);

export const structureStatsRepository = {
  ...baseRepository,
  findByStructureIdAndDate,
};

async function findByStructureIdAndDate({
  structureId,
  statsDateUTC,
}: {
  structureId: number;
  statsDateUTC: Date;
}): Promise<StructureStats> {
  const statsDateUTCString = moment.utc(statsDateUTC).format("YYYY-MM-DD");
  const x = await baseRepository.findOneWithQuery({
    select: STRUCTURE_STATS_ATTRIBUTES,
    alias: "x",
    where: `"structureId"=:structureId and "date"=(:statsDateUTCString::"date")`,
    params: {
      structureId,
      statsDateUTCString,
    },
    logSql: false,
  });
  return x;
}
