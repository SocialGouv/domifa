import { UsagerLight } from "./../../../_common/model/usager/UsagerLight.type";
import moment = require("moment");
import { EntityManager, In } from "typeorm";
import { Usager } from "../../../_common/model";
import { UsagerTable } from "../../entities";
import {
  appTypeormManager,
  pgRepository,
  postgresQueryBuilder,
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
  countUsagers,
  searchUsagersByEndDom,
};

function countAyantsDroits(structuresId?: number[]): Promise<number> {
  return _advancedCount({ countType: "ayant-droit", structuresId });
}

function countUsagers(structuresId?: number[]): Promise<number> {
  return _advancedCount({ countType: "domicilie", structuresId });
}

async function countDocuments() {
  return usagerRepository.aggregateAsNumber({
    expression: 'sum(jsonb_array_length("docs"))',
    resultAlias: "count",
    // logSql: true,
  });
}

async function countUsagersByMonth(regionId?: string) {
  const startDate = postgresQueryBuilder.formatPostgresDate(
    moment()
      .utc()
      .subtract(2, "month")
      .subtract(1, "year")
      .endOf("month")
      .toDate()
  );

  const where = [startDate];

  let query = `select date_trunc('month', "createdAt") as date,
                COUNT(uuid) AS count,
                sum(jsonb_array_length("ayantsDroits")) as ayantsDroits
                FROM usager u WHERE "createdAt" > $1 `;

  if (regionId) {
    query =
      query +
      ` and "structureId" in (select id from "structure" s where "region"=$2)`;

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
  return usagerCoreRepository.aggregateAsNumber(query);
}

async function searchUsagersByEndDom() {
  const query = `select s.nom as "nomStructure", s.sms->>'senderDetails' as "senderDetails", u.*
                 from usager u join "structure" s on "structureId" = s.id
                 where decision->>'statut' = 'VALIDE'
                 and (s.sms->>'enabledByDomifa')::boolean is true
                 and (s.sms->>'enabledByStructure')::boolean is true
                 and (u.preference->>'phone')::boolean is true
                 and to_char((decision->>'dateFin')::timestamptz, 'YYYY-MM-DD') = to_char(current_date + interval '1 month' * 2, 'YYYY-MM-DD')`;

  return appTypeormManager.getRepository(UsagerTable).query(query);
}
