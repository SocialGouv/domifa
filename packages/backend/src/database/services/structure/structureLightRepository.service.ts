import { StructureTable } from "../../entities";
import { myDataSource } from "../_postgres";

export const structureLightRepository =
  myDataSource.getRepository(StructureTable);
