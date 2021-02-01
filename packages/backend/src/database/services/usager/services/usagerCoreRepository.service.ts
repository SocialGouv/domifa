import { EntityManager } from "typeorm";
import { UsagerPG, UsagerTable } from "../../../entities";
import { pgRepository } from "../../_postgres";

const baseRepository = pgRepository.get<UsagerTable, UsagerPG>(UsagerTable);

export const usagerCoreRepository = {
  getForMigration: (entityManager: EntityManager) =>
    pgRepository.get<UsagerTable, UsagerPG>(UsagerTable, {
      entityManager,
    }),
  ...baseRepository,
};
