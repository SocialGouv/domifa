import {
  StructureStatsQuestionsRaisonDemande,
  StructureStatsSexe,
  StructureStatsTranchesAge,
} from "../../../_common/model";
import { UsagerRaisonDemande, UsagerSexe } from "../../entities";
import { UsagerAvancedSearchCriteria } from "./services";
import { usagerAdvancedSearchQueryBuilder } from "./services/usagerAdvancedSearchQueryBuilder.service";
import { usagerCoreRepository } from "./services/usagerCoreRepository.service";

export const usagerRepository = {
  ...usagerCoreRepository,
  countDomiciliations,
  countAyantsDroits,
  countDocuments,
  countBySexe,
  countByRaisonDemande,
  countByTranchesAge,
};

function countDomiciliations(
  params: UsagerAvancedSearchCriteria = {}
): Promise<number> {
  return _advancedCount({
    ...params,
    countType: "domicilie",
  });
}
function countAyantsDroits(
  params: UsagerAvancedSearchCriteria = {}
): Promise<number> {
  return _advancedCount({
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
function _advancedCount({
  countType,
  logSql,
  ...criteria
}: UsagerAvancedSearchCriteria & {
  countType: "domicilie" | "ayant-droit";
}): Promise<number> {
  const { where, params } = usagerAdvancedSearchQueryBuilder.buildQuery(
    criteria
  );

  const expression =
    countType === "domicilie"
      ? `COUNT("uuid")`
      : 'sum(jsonb_array_length("ayantsDroits"))';

  return usagerCoreRepository.aggregateAsNumber({
    alias: "u",
    where: where,
    params,
    expression,
    resultAlias: "count",
    logSql,
  });
}

async function countBySexe(
  criteria: UsagerAvancedSearchCriteria = {}
): Promise<StructureStatsSexe> {
  const { where, params } = usagerAdvancedSearchQueryBuilder.buildQuery(
    criteria
  );
  const stats: {
    sexe: UsagerSexe;
    count: number;
  }[] = await usagerCoreRepository.countBy({
    alias: "u",
    countBy: "sexe",
    order: {
      count: "ASC",
      countBy: "ASC",
    },
    where,
    params,
  });

  return {
    H: _findCountByKey(stats, "sexe", "homme"),
    F: _findCountByKey(stats, "sexe", "femme"),
  };
}
async function countByRaisonDemande(
  criteria: UsagerAvancedSearchCriteria = {}
): Promise<StructureStatsQuestionsRaisonDemande> {
  const { where, params } = usagerAdvancedSearchQueryBuilder.buildQuery(
    criteria
  );
  const stats: {
    raison: UsagerRaisonDemande;
    count: number;
  }[] = (await usagerCoreRepository.countBy({
    alias: "u",
    countBy: `"entretien"->>'raison'` as any,
    countByAlias: "raison",
    order: {
      count: "ASC",
      countBy: "ASC",
    },
    where,
    params,
    escapeAttributes: false,
  })) as any;

  return {
    PRESTATIONS_SOCIALES: _findCountByKey(
      stats,
      "raison",
      "PRESTATIONS_SOCIALES"
    ),
    EXERCICE_DROITS: _findCountByKey(stats, "raison", "EXERCICE_DROITS"),
    AUTRE: _findCountByKey(stats, "raison", "AUTRE"),
  };
}

async function countByTranchesAge(
  criteria: UsagerAvancedSearchCriteria & {
    ageReferenceDate: Date;
  }
): Promise<StructureStatsTranchesAge> {
  const { where, params } = usagerAdvancedSearchQueryBuilder.buildQuery(
    criteria
  );
  const ageReferenceDateIso = criteria.ageReferenceDate.toISOString();

  const typeormRepository = await usagerRepository.typeorm();
  let qb = typeormRepository
    .createQueryBuilder()
    .select(
      `CASE
        WHEN date_part('year',age('${ageReferenceDateIso}', "dateNaissance"))::int < 15  THEN 'T_0_14'
        WHEN date_part('year',age('${ageReferenceDateIso}', "dateNaissance"))::int < 20  THEN 'T_15_19'
        WHEN date_part('year',age('${ageReferenceDateIso}', "dateNaissance"))::int < 25  THEN 'T_20_24'
        WHEN date_part('year',age('${ageReferenceDateIso}', "dateNaissance"))::int < 30  THEN 'T_25_29'
        WHEN date_part('year',age('${ageReferenceDateIso}', "dateNaissance"))::int < 35  THEN 'T_30_34'
        WHEN date_part('year',age('${ageReferenceDateIso}', "dateNaissance"))::int < 40  THEN 'T_35_39'
        WHEN date_part('year',age('${ageReferenceDateIso}', "dateNaissance"))::int < 45  THEN 'T_40_44'
        WHEN date_part('year',age('${ageReferenceDateIso}', "dateNaissance"))::int < 50  THEN 'T_45_49'
        WHEN date_part('year',age('${ageReferenceDateIso}', "dateNaissance"))::int < 55  THEN 'T_50_54'
        WHEN date_part('year',age('${ageReferenceDateIso}', "dateNaissance"))::int < 60  THEN 'T_55_59'
        WHEN date_part('year',age('${ageReferenceDateIso}', "dateNaissance"))::int < 65  THEN 'T_60_64'
        WHEN date_part('year',age('${ageReferenceDateIso}', "dateNaissance"))::int < 70  THEN 'T_65_69'
        WHEN date_part('year',age('${ageReferenceDateIso}', "dateNaissance"))::int < 75  THEN 'T_70_74'
        ELSE '75_PLUS'
      END`,
      "tranche_age"
    )
    .addSelect("count(*)", "count")
    .where(where, params)
    .groupBy(`"tranche_age"`);

  const results = await qb.getRawMany();

  const stats: {
    tranche_age: keyof StructureStatsTranchesAge;

    count: number;
  }[] = usagerRepository._parseCounts(results, {
    label: "tranche_age",
  });
  return {
    T_0_14: _findCountByKey(stats, "tranche_age", "T_0_14"),
    T_15_19: _findCountByKey(stats, "tranche_age", "T_15_19"),
    T_20_24: _findCountByKey(stats, "tranche_age", "T_20_24"),
    T_25_29: _findCountByKey(stats, "tranche_age", "T_25_29"),
    T_30_34: _findCountByKey(stats, "tranche_age", "T_30_34"),
    T_35_39: _findCountByKey(stats, "tranche_age", "T_35_39"),
    T_40_44: _findCountByKey(stats, "tranche_age", "T_40_44"),
    T_45_49: _findCountByKey(stats, "tranche_age", "T_45_49"),
    T_50_54: _findCountByKey(stats, "tranche_age", "T_50_54"),
    T_55_59: _findCountByKey(stats, "tranche_age", "T_55_59"),
    T_60_64: _findCountByKey(stats, "tranche_age", "T_60_64"),
    T_65_69: _findCountByKey(stats, "tranche_age", "T_65_69"),
    T_70_74: _findCountByKey(stats, "tranche_age", "T_70_74"),
    T_75_PLUS: _findCountByKey(stats, "tranche_age", "T_75_PLUS"),
  };
}
function _findCountByKey<
  T extends {
    count: number;
  },
  CountBy extends keyof T
>(
  stats: T[],
  key: CountBy,
  value: Pick<T, CountBy>[CountBy],
  defaultValue: number = 0
): number {
  return stats.find((x) => x[key] === value)?.count ?? defaultValue;
}
