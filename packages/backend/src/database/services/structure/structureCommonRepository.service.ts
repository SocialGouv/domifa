import {
  StructureCommon,
  STRUCTURE_COMMON_ATTRIBUTES,
} from "../../../_common/model";
import { StructureTable } from "../../entities";
import { pgRepository } from "../_postgres";

const baseRepository = pgRepository.get<StructureTable, StructureCommon>(
  StructureTable,
  { defaultSelect: STRUCTURE_COMMON_ATTRIBUTES }
);

export const structureCommonRepository = {
  ...baseRepository,
};
