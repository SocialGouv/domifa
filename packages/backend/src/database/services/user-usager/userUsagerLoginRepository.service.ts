import { Between } from "typeorm";
import { UserUsagerLoginTable } from "../../entities";
import { myDataSource } from "../_postgres";

export const userUsagerLoginRepository = myDataSource
  .getRepository(UserUsagerLoginTable)
  .extend({
    countBetween(
      dateInteractionBefore: Date,
      dateInteractionAfter: Date,
      structureId: number
    ) {
      return userUsagerLoginRepository.countBy({
        structureId,
        createdAt: Between(dateInteractionAfter, dateInteractionBefore),
      });
    },
  });
