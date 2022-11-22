import { format, startOfMonth, subYears } from "date-fns";

import { myDataSource } from "..";
import { domifaConfig } from "./../../../config/domifaConfig.service";

import { UsagerTable } from "../../entities";
import {
  appTypeormManager,
  pgRepository,
  postgresQueryBuilder,
} from "../_postgres";

import { Usager } from "../../../_common/model";
import { FranceRegion } from "../../../util/territoires";

const baseRepository = pgRepository.get<UsagerTable, Usager>(UsagerTable);

export const usagerRepository = myDataSource
  .getRepository<Usager>(UsagerTable)
  .extend({
    ...baseRepository,
    customCountBy: baseRepository.countBy,
    countAyantsDroits,
    countUsagersByMonth,
    countTotalUsagers,
    countUsagers,
  });

function countAyantsDroits(structuresId?: number[]): Promise<number> {
  return _advancedCount({ countType: "ayant-droit", structuresId });
}

function countUsagers(structuresId?: number[]): Promise<number> {
  return _advancedCount({ countType: "domicilie", structuresId });
}

async function countUsagersByMonth(regionId?: FranceRegion) {
  const lastMonth = startOfMonth(new Date());
  const oneYearAgo = subYears(lastMonth, 1);

  let startDate = format(oneYearAgo, "yyyy-MM-dd");
  const endDate = format(lastMonth, "yyyy-MM-dd");

  if (domifaConfig().envId === "test") {
    startDate = postgresQueryBuilder.formatPostgresDate(new Date("2021-07-31"));
  }

  const where = [startDate, endDate];

  let query = `select date_trunc('month', "createdAt") as date, COUNT(uuid) AS count, sum(jsonb_array_length("ayantsDroits")) as ayantsDroits FROM usager u WHERE "createdAt" BETWEEN $1 and $2 `;

  if (regionId) {
    query += ` and "structureId" in (select id from "structure" s where "region"=$3)`;
    where.push(regionId);
  }
  query = query + ` GROUP BY 1`;
  return appTypeormManager.getRepository(UsagerTable).query(query, where);
}

function _advancedCount({
  countType,
  logSql,
  structuresId,
}: {
  countType: "domicilie" | "ayant-droit";
  logSql?: boolean;
  structuresId?: number[];
}): Promise<number> {
  const expression =
    countType === "domicilie"
      ? `COUNT("uuid")`
      : 'sum(jsonb_array_length("ayantsDroits"))';

  const query: {
    expression: string;
    resultAlias: string;
    where?: any;
    params?: { [attr: string]: any };
    alias?: string;
    logSql?: boolean;
  } = {
    alias: "u",
    expression,
    resultAlias: "count",
    logSql,
  };

  if (structuresId) {
    query.where = `u.structureId IN(:...ids)`;
    query.params = { ids: structuresId };
  }

  return usagerRepository.aggregateAsNumber(query);
}

async function countTotalUsagers(structuresId?: number[]): Promise<number> {
  const usagers = await usagerRepository.countUsagers(structuresId);
  const ayantsDroits = await usagerRepository.countAyantsDroits(structuresId);
  return usagers + ayantsDroits;
}
