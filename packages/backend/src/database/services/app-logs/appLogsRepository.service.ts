import { pgRepository } from "..";
import { AppLog } from "../../../_common/model";
import { AppLogTable } from "../../entities/app-log/AppLogTable.typeorm";

const baseRepository = pgRepository.get<AppLogTable, AppLog>(AppLogTable);

export const appLogsRepository = {
  ...baseRepository,
};
