import { UsagerHistory, UsagerHistoryStates } from "../../../_common/model";
import { UsagerHistoryStatesTable } from "../../entities/usager/UsagerHistoryStatesTable.typeorm";
import { UsagerHistoryTable } from "../../entities/usager/UsagerHistoryTable.typeorm";
import { myDataSource } from "../_postgres";

export const usagerHistoryRepository =
  myDataSource.getRepository<UsagerHistory>(UsagerHistoryTable);

export const usagerHistoryStatesRepository =
  myDataSource.getRepository<UsagerHistoryStates>(UsagerHistoryStatesTable);
