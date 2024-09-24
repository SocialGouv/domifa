import { StructureInformation } from "@domifa/common";
import { myDataSource } from "../_postgres";
import { StructureInformationTable } from "../../entities/structure/StructureInformationTable.typeorm";

export const structureInformationRepository =
  myDataSource.getRepository<StructureInformation>(StructureInformationTable);
