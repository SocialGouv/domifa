import {
  PortailUsagerPublic,
  Usager,
  UsagersCountByStatus,
} from "@domifa/common";

import { myDataSource } from "..";
import { UsagerTable } from "../../entities";
import { joinSelectFields } from "../_postgres";
import { USER_USAGER_ATTRIBUTES } from "../../../modules/portail-usagers/constants";
import { getDateForMonthInterval } from "../../../modules/stats/services";

export const usagerRepository = myDataSource
  .getRepository<Usager>(UsagerTable)
  .extend({
    countMigratedUsagers,
    getUsager,
    countAyantsDroits,
    countUsagersByMonth,
    countTotalUsagers,
    countUsagers,
    findNextMeetings,
    findLastFiveCustomRef,
    getUserUsagerData,
    countTotalActifs,
    countUsagersByStatus,
  });

async function countUsagersByStatus(
  structureId: number,
  onlyActivatedAccounts: boolean = false
): Promise<UsagersCountByStatus> {
  const portailCondition = onlyActivatedAccounts
    ? `AND options ->> 'portailUsagerEnabled' = 'true'`
    : "";

  const query = `
    SELECT
      COUNT(*) FILTER (WHERE statut = 'INSTRUCTION') AS instruction_count,
      COUNT(*) FILTER (WHERE statut = 'VALIDE') AS valide_count,
      COUNT(*) FILTER (WHERE statut = 'ATTENTE_DECISION') AS attente_count,
      COUNT(*) FILTER (WHERE statut = 'REFUS') AS refus_count,
      COUNT(*) FILTER (WHERE statut = 'RADIE') AS radie_count,
      COUNT(*) AS tous_count
    FROM usager
    WHERE "structureId" = $1
    ${portailCondition}
  `;

  const [result] = await myDataSource.query(query, [structureId]);

  return {
    INSTRUCTION: parseInt(result.instruction_count || "0", 10),
    VALIDE: parseInt(result.valide_count || "0", 10),
    ATTENTE_DECISION: parseInt(result.attente_count || "0", 10),
    REFUS: parseInt(result.refus_count || "0", 10),
    RADIE: parseInt(result.radie_count || "0", 10),
    TOUS: parseInt(result.tous_count || "0", 10),
  };
}

export async function getUserUsagerData({
  usagerUUID,
}: {
  usagerUUID: string;
}): Promise<PortailUsagerPublic> {
  return usagerRepository.findOneOrFail({
    where: {
      uuid: usagerUUID,
    },
    select: USER_USAGER_ATTRIBUTES,
  });
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

async function countAyantsDroits(regionId?: string): Promise<number> {
  return aggregateUsagers(
    `SUM(jsonb_array_length(u."ayantsDroits"))`,
    regionId
  );
}

async function countUsagers(regionId?: string): Promise<number> {
  return aggregateUsagers(`COUNT(u."uuid")`, regionId);
}

// Inline COUNT/SUM with optional region filter via INNER JOIN on structure —
// safe because `aggregation` is a hardcoded string literal (no caller-supplied
// expression) and `regionId` is a bound parameter.
async function aggregateUsagers(
  aggregation: string,
  regionId?: string
): Promise<number> {
  const qb = usagerRepository
    .createQueryBuilder("u")
    .select(aggregation, "count");

  if (regionId) {
    qb.innerJoin("structure", "s", `s.id = u."structureId"`)
      .where("s.region = :regionId", { regionId })
      .andWhere("s.statut = :statut", { statut: "VALIDE" });
  }

  const result = await qb.getRawOne<{ count: string | null }>();
  return parseInt(result?.count ?? "0", 10);
}

async function countUsagersByMonth(regionId?: string) {
  const { startDate, endDate } = getDateForMonthInterval();

  const where = [startDate, endDate];

  let query = `select date_trunc('month', "createdAt") as date, COUNT(uuid) AS count, sum(jsonb_array_length("ayantsDroits")) as ayantsDroits FROM usager u WHERE "createdAt" BETWEEN $1 and $2`;

  if (regionId) {
    query += ` and "structureId" in (select id from "structure" s where "region"=$3)`;
    where.push(regionId);
  }
  query = query + ` GROUP BY 1`;
  return usagerRepository.query(query, where);
}

async function countTotalUsagers(regionId?: string): Promise<number> {
  const [usagers, ayantsDroits] = await Promise.all([
    usagerRepository.countUsagers(regionId),
    usagerRepository.countAyantsDroits(regionId),
  ]);
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
  WITH LatestEntries AS (
    SELECT
      DISTINCT ON ("usagerUUID") "usagerUUID",
      "uuid",
      "structureId",
      "historyBeginDate"
    FROM
      "usager_history_states"
    WHERE
      "isActive" IS TRUE
      AND ("historyBeginDate") ::timestamptz <=  CURRENT_DATE + INTERVAL '1 day'
      AND (
        "historyEndDate" is null
        OR ("historyEndDate")::timestamptz >=  CURRENT_DATE + INTERVAL '1 day'
      )
    ORDER BY
      "usagerUUID",
      "historyBeginDate" desc
  )
  SELECT
    (COUNT(DISTINCT uh."usagerUUID") +   SUM(COALESCE(jsonb_array_length("uh"."ayantsDroits"), 0))) AS "actifs",
    SUM(COALESCE(jsonb_array_length("uh"."ayantsDroits"), 0) ) AS "ayantsDroits",
    COUNT(DISTINCT uh."usagerUUID") AS "domicilies"
  from
    "usager_history_states" uh
    inner join LatestEntries as le ON uh."uuid" = le."uuid"
`);

  return {
    domicilies: parseInt(usagers[0].domicilies, 10),
    ayantsDroits: parseInt(usagers[0].ayantsDroits, 10),
    actifs: parseInt(usagers[0].actifs, 10),
  };
}

async function countMigratedUsagers(structureId: number): Promise<number> {
  return myDataSource
    .getRepository<Usager>(UsagerTable)
    .countBy({ migrated: false, structureId });
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
      `statut = :statut and "structureId" = :structureId and ref != :usagerRef`,
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
  structureId,
  dateRefNow = new Date(),
}: {
  userId: number;
  structureId: number;
  dateRefNow?: Date;
}): Promise<Pick<Usager, "nom" | "prenom" | "uuid" | "ref" | "rdv">[]> {
  return usagerRepository
    .createQueryBuilder("usager")
    .select(joinSelectFields(["nom", "prenom", "uuid", "ref", "rdv"]))
    .where(
      `"structureId" = :structureId AND rdv->>'userId' = :userId and (rdv->>'dateRdv')::timestamptz >= :dateRefNow`,
      {
        structureId,
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
