import { UserUsager } from "../../../_common/model";
import { UserUsagerTable } from "../../entities";
import { pgRepository } from "../_postgres";

const baseRepository = pgRepository.get<UserUsagerTable, UserUsager>(
  UserUsagerTable,
  {
    defaultSelect: "ALL",
  }
);

export const userUsagerRepository = {
  ...baseRepository,
};
