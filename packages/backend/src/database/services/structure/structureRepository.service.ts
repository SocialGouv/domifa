import { StructurePG } from "../../../_common/model";
import { StructureTable } from "../../entities";
import { pgRepository } from "../_postgres";

const baseRepository = pgRepository.get<StructureTable, StructurePG>(
  StructureTable
);

export const structureRepository = {
  ...baseRepository,
};
