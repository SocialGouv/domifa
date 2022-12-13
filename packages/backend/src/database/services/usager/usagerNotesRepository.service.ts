import { UsagerNote } from "./../../../_common/model/usager/UsagerNote.type";
import { UsagerNotesTable } from "../../entities/usager/UsagerNotesTable.typeorm";
import { myDataSource } from "../_postgres";

export const usagerNotesRepository =
  myDataSource.getRepository<UsagerNote>(UsagerNotesTable);
