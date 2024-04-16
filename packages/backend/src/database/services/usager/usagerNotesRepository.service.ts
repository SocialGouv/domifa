import { UsagerNote } from "@domifa/common";
import { UsagerNotesTable } from "../../entities/usager/UsagerNotesTable.typeorm";
import { myDataSource } from "../_postgres";

export const usagerNotesRepository =
  myDataSource.getRepository<UsagerNote>(UsagerNotesTable);
