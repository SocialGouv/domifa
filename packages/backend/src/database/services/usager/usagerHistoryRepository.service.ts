import { UsagerHistory } from "../../../_common/model";
import { UsagerHistoryTable } from "../../entities/usager/UsagerHistoryTable.typeorm";
import { myDataSource } from "../_postgres";

export const usagerHistoryRepository =
  myDataSource.getRepository<UsagerHistory>(UsagerHistoryTable);
