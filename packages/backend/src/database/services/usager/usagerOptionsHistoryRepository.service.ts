import { UsagerOptionsHistoryTable } from "../../entities/usager/UsagerOptionsHistoryTable.typeorm";
import { myDataSource } from "../_postgres";

export const usagerOptionsHistoryRepository = myDataSource.getRepository(
  UsagerOptionsHistoryTable
);
