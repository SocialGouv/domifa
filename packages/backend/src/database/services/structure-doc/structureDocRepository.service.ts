import { StructureDoc } from "@domifa/common";
import { StructureDocTable } from "../../entities/structure-doc";
import { myDataSource } from "../_postgres";

export const structureDocRepository =
  myDataSource.getRepository<StructureDoc>(StructureDocTable);
