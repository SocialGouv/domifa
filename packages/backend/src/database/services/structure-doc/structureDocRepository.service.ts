import { myDataSource } from "./../_postgres/appTypeormManager.service";

import { StructureDocTable } from "../../entities/structure-doc";

export const structureDocRepository =
  myDataSource.getRepository(StructureDocTable);
