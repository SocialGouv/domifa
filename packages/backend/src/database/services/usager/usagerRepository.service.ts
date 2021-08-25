import { raw } from "express";
import moment = require("moment");
import { EntityManager } from "typeorm";
import { Usager } from "../../../_common/model";
import { UsagerTable } from "../../entities";
import {
  pgRepository,
  postgresQueryBuilder,
  typeOrmSearch,
} from "../_postgres";
import { usagerCoreRepository } from "./services/usagerCoreRepository.service";

export const usagerRepository = {
  ...usagerCoreRepository,
  getForMigration: (entityManager: EntityManager) =>
    pgRepository.get<UsagerTable, Usager>(UsagerTable, {
      entityManager,
    }),
  countAyantsDroits,
  countDocuments,
  countUsagersByMonth,
  countUsagersByRegion,
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

async function countUsagersByRegion(regionId: string) {
  const query = `select COUNT(uuid)
  FROM usager u WHERE "structureId" in (select id from "structure" s where  "region"=$1)`;

  return usagerRepository.aggregateAsNumber({
    expression: 'sum(jsonb_array_length("docs"))',
    where: typeOrmSearch<any>(
      '"structureId" in (select id from "structure" s where "region"=:regionId)'
    ),
    resultAlias: "count",
    params: { regionId },
  });
}

async function countUsagersByMonth(regionId?: string) {
  const startDate = postgresQueryBuilder.formatPostgresDate(
    moment().subtract(1, "year").add(1, "month").startOf("month").toDate()
  );

  const where = [startDate];

  let query = `select date_trunc('month', "createdAt") as date,
        COUNT(uuid) AS count
        FROM usager u
        WHERE "createdAt" > $1 `;

  if (regionId) {
    query =
      query +
      ` and "structureId" in (select id from "structure" s where  "region"=$2)`;

    where.push(regionId);
  }

  query = query + ` GROUP BY 1`;

  const rawResults = await (
    await usagerRepository.typeorm()
  ).query(query, where);

  return rawResults;
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
