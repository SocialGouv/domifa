import {
  usagerAdvancedSearchRepository,
  UsagerAvancedSearchCriteria,
} from "./services";
import { usagerCoreRepository } from "./services/usagerCoreRepository.service";

export const usagerRepository = {
  ...usagerCoreRepository,
  countDomiciliations,
  countAyantsDroits,
  countDocuments,
};

function countDomiciliations(
  params: UsagerAvancedSearchCriteria = {}
): Promise<number> {
  return usagerAdvancedSearchRepository._advancedCount({
    ...params,
    countType: "domicilie",
  });
}
function countAyantsDroits(
  params: UsagerAvancedSearchCriteria = {}
): Promise<number> {
  return usagerAdvancedSearchRepository._advancedCount({
    ...params,
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
