import { EntityManager } from "typeorm";
import { Usager } from "../../../../_common/model";
import { UsagerTable } from "../../../entities";
import { pgRepository } from "../../_postgres";

const baseRepository = pgRepository.get<UsagerTable, Usager>(UsagerTable);

export const usagerCoreRepository = {
  getForMigration: (entityManager: EntityManager) =>
    pgRepository.get<UsagerTable, Usager>(UsagerTable, {
      entityManager,
    }),
  ...baseRepository,
};
