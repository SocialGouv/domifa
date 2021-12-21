import { pgRepository } from "..";
import { Log } from "../../../_common/model";
import { LogTable } from "../../entities/log/LogTable.typeorm";

const baseRepository = pgRepository.get<LogTable, Log>(LogTable);

export const logsRepository = {
  ...baseRepository,
};
