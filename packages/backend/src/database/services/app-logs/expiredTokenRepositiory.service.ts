import { ExpiredTokenTable } from "../../entities/app-log/ExpiredTokenTable.typeorm";
import { myDataSource } from "../_postgres";
export const expiredTokenRepositiory =
  myDataSource.getRepository(ExpiredTokenTable);
