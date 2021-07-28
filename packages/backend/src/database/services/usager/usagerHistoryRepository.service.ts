import { UsagerHistory } from "../../../_common/model";
import { UsagerHistoryTable } from "../../entities/usager/UsagerHistoryTable.typeorm";
import { pgRepository } from "../_postgres/pgRepository.service";

const baseRepository = pgRepository.get<UsagerHistoryTable, UsagerHistory>(
  UsagerHistoryTable
);

export const usagerHistoryRepository = {
  ...baseRepository,
};
