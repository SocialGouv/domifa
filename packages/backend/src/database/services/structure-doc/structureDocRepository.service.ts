import { myDataSource } from "./../_postgres/appTypeormManager.service";

import { StructureDocTable } from "../../entities/structure-doc";
import { StructureDoc } from "../../../_common/model";

export const structureDocRepository =
  myDataSource.getRepository<StructureDoc>(StructureDocTable);
