import { UsagerOptionsHistory } from "../../../_common/model";
import { UsagerOptionsHistoryTable } from "../../entities/usager/UsagerOptionsHistoryTable.typeorm";
import { pgRepository } from "../_postgres/pgRepository.service";

const baseRepository = pgRepository.get<
  UsagerOptionsHistoryTable,
  UsagerOptionsHistory
>(UsagerOptionsHistoryTable);

export const usagerOptionsHistoryRepository = {
  ...baseRepository,
};
