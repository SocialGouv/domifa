import { USAGER_PORTAIL_ATTRIBUTES, myDataSource } from "..";

import { UsagerTable } from "../../entities";
import { joinSelectFields, pgRepository } from "../_postgres";

import { Usager } from "../../../_common/model";
import { getDateForMonthInterval } from "../../../stats/services";
import { PortailUsagerPublic } from "@domifa/common";

const baseRepository = pgRepository.get<UsagerTable, Usager>(UsagerTable);

export const usagerRepository = myDataSource
  .getRepository<Usager>(UsagerTable)
  .extend({
    countMigratedUsagers,
    aggregateAsNumber: baseRepository.aggregateAsNumber,
    _parseCounts: baseRepository._parseCounts,
    countBy: baseRepository.countBy,
    getUsager,
    updateOneAndReturn,
    customCountBy: baseRepository.countBy,
    countAyantsDroits,
    countUsagersByMonth,
    countTotalUsagers,
    countUsagers,
    findNextMeetings,
    findLastFiveCustomRef,
    getUserUsagerData,
    countTotalActifs,
  });

export async function getUserUsagerData({
  usagerUUID,
}: {
  usagerUUID: string;
}): Promise<PortailUsagerPublic> {
  return usagerRepository.findOneOrFail({
    where: {
      uuid: usagerUUID,
    },
    select: USAGER_PORTAIL_ATTRIBUTES,
  });
}

export async function updateOneAndReturn(
  uuid: string,
  partialUpdate: Partial<Usager>
): Promise<Usager> {
  await usagerRepository.update({ uuid }, partialUpdate);
  return getUsager(uuid);
}

async function getUsager(uuid: string): Promise<Usager> {
  return usagerRepository.findOneOrFail({
    where: {
      uuid,
    },
    relations: {
      entretien: true,
    },
  });
}

async function countAyantsDroits(structuresId?: number[]): Promise<number> {
  return _advancedCount({ countType: "ayant-droit", structuresId });
}

async function countUsagers(structuresId?: number[]): Promise<number> {
  return _advancedCount({ countType: "domicilie", structuresId });
}

async function countUsagersByMonth(regionId?: string) {
  const { startDate, endDate } = getDateForMonthInterval();

  const where = [startDate, endDate];

  let query = `select date_trunc('month', "createdAt") as date, COUNT(uuid) AS count, sum(jsonb_array_length("ayantsDroits")) as ayantsDroits FROM usager u WHERE "createdAt" BETWEEN $1 and $2 `;

  if (regionId) {
    query += ` and "structureId" in (select id from "structure" s where "region"=$3)`;
    where.push(regionId);
  }
  query = query + ` GROUP BY 1`;
  return usagerRepository.query(query, where);
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

async function countTotalActifs(): Promise<{
  domicilies: number;
  ayantsDroits: number;
  actifs: number;
}> {
  const usagers: {
    domicilies: string;
    ayantsDroits: string;
    actifs: string;
  }[] = await usagerRepository.query(`
    SELECT
    COUNT(DISTINCT uh."usagerUUID") as "domicilies",
    COALESCE(SUM(jsonb_array_length(state->'ayantsDroits')), 0) as "ayantsDroits",
    COUNT(DISTINCT uh."usagerUUID") + COALESCE(SUM(jsonb_array_length(state->'ayantsDroits')), 0) AS "actifs"
    FROM "usager_history" uh JOIN usager u ON uh."usagerUUID" = u.uuid JOIN jsonb_array_elements(uh.states) AS state ON true
    WHERE
    (state->>'isActive')::boolean
    AND (state->>'historyBeginDate')::timestamptz <  CURRENT_DATE + INTERVAL '1 day'
    AND (state->>'historyEndDate' is null OR (state->>'historyEndDate')::timestamptz >=  CURRENT_DATE + INTERVAL '1 day' )
`);
  return {
    domicilies: parseInt(usagers[0].domicilies, 10),
    ayantsDroits: parseInt(usagers[0].ayantsDroits, 10),
    actifs: parseInt(usagers[0].actifs, 10),
  };
}

async function countMigratedUsagers(): Promise<number> {
  return myDataSource
    .getRepository<Usager>(UsagerTable)
    .countBy({ migrated: false });
}

async function findLastFiveCustomRef({
  structureId,
  usagerRef,
}: {
  structureId: number;
  usagerRef: number;
}): Promise<
  Pick<
    Usager,
    "ref" | "customRef" | "nom" | "sexe" | "prenom" | "structureId"
  >[]
> {
  return usagerRepository
    .createQueryBuilder("usager")
    .select(
      joinSelectFields([
        "ref",
        "customRef",
        "nom",
        "sexe",
        "prenom",
        "structureId",
      ])
    )
    .where(
      `decision->>'statut' = :statut and "structureId" = :structureId and ref != :usagerRef`,
      {
        statut: "VALIDE",
        structureId,
        usagerRef,
      }
    )
    .orderBy({ "(decision->>'dateDecision')::timestamptz": "DESC" })
    .limit(5)
    .getRawMany();
}

async function findNextMeetings({
  userId,
  dateRefNow = new Date(),
}: {
  userId: number;
  dateRefNow?: Date;
}): Promise<Pick<Usager, "nom" | "prenom" | "uuid" | "ref" | "rdv">[]> {
  return usagerRepository
    .createQueryBuilder("usager")
    .select(joinSelectFields(["nom", "prenom", "uuid", "ref", "rdv"]))
    .where(
      `rdv->>'userId' = :userId and (rdv->>'dateRdv')::timestamptz > :dateRefNow`,
      {
        userId,
        dateRefNow,
      }
    )
    .orderBy({
      "(rdv->>'dateRdv')::timestamptz": "DESC",
    })
    .limit(5)
    .getRawMany();
}
