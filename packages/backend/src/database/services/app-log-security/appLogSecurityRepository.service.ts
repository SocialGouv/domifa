import { myDataSource } from "..";
import { AppLogSecurityTable } from "../../entities/app-log-security/AppLogSecurityTable.typeorm";
export const appLogSecurityRepository =
  myDataSource.getRepository(AppLogSecurityTable);
