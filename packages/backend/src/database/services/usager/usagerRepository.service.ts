import { EntityManager } from "typeorm";
import { Usager } from "../../../_common/model";
import { UsagerTable } from "../../entities";
import { pgRepository } from "../_postgres";
import { usagerCoreRepository } from "./services/usagerCoreRepository.service";

export const usagerRepository = {
  ...usagerCoreRepository,
  getForMigration: (entityManager: EntityManager) =>
    pgRepository.get<UsagerTable, Usager>(UsagerTable, {
      entityManager,
    }),
  countAyantsDroits,
  countDocuments,
};

function countAyantsDroits(): Promise<number> {
  return _advancedCount({
    countType: "ayant-droit",
  });
}

async function countDocuments() {
  return usagerRepository.aggregateAsNumber({
    expression: 'sum(jsonb_array_length("docs"))',
    resultAlias: "count",
    // logSql: true,
  });
}

function _advancedCount({
  countType,
  logSql,
}: {
  countType: "domicilie" | "ayant-droit";
  logSql?: boolean;
}): Promise<number> {
  const expression =
    countType === "domicilie"
      ? `COUNT("uuid")`
      : 'sum(jsonb_array_length("ayantsDroits"))';

  return usagerCoreRepository.aggregateAsNumber({
    alias: "u",
    expression,
    resultAlias: "count",
    logSql,
  });
}
