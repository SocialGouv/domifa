import { StructureStats } from "../../../_common/model";
import { StructureStatsTable } from "../../entities";
import { pgRepository } from "../_postgres";

const baseRepository = pgRepository.get<StructureStatsTable, StructureStats>(
  StructureStatsTable
);

export const structureStatsRepository = {
  ...baseRepository,
};
