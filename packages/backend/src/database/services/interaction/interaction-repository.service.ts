import { Interactions } from "../../../_common/model/interaction";
import { InteractionsTable } from "../../entities";
import { pgRepository } from "../_postgres";

const baseRepository = pgRepository.get<InteractionsTable, Interactions>(
  InteractionsTable
);

export const interactionRepository = {
  ...baseRepository,
};
