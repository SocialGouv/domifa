import { StructureDoc } from "../../../_common/model/structure-doc";
import { StructureDocTable } from "../../entities/structure-doc";
import { pgRepository } from "../_postgres";

const baseRepository = pgRepository.get<StructureDocTable, StructureDoc>(
  StructureDocTable
);

export const structureDocRepository = {
  ...baseRepository,
};
