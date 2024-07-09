import { myDataSource } from "..";
import { AppLogTable } from "../../entities/app-log/AppLogTable.typeorm";
export const appLogsRepository = myDataSource.getRepository(AppLogTable);
