import moment = require("moment");
import {
  PortailUsagerStructure,
  STRUCTURE_LIGHT_ATTRIBUTES,
} from "../../../_common/model";
import { StructureTable } from "../../entities";
import { pgRepository } from "../_postgres";

const baseRepository = pgRepository.get<StructureTable, PortailUsagerStructure>(
  StructureTable,
  { defaultSelect: STRUCTURE_LIGHT_ATTRIBUTES }
);

export const structurePortailRepository = {
  ...baseRepository,
};
