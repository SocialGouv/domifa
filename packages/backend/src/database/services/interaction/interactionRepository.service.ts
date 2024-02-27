import { In, IsNull } from "typeorm";
import { getDateForMonthInterval } from "../../../stats/services";
import { Usager, UserStructureAuthenticated } from "../../../_common/model";
import { INTERACTION_OK_LIST } from "../../../_common/model/interaction";
import { InteractionsTable } from "../../entities";
import { myDataSource } from "../_postgres";
import {
  CommonInteraction,
  InteractionType,
  StructureStatsQuestionsInPeriodInteractions,
} from "@domifa/common";

export const interactionRepository = myDataSource
  .getRepository<CommonInteraction>(InteractionsTable)
  .extend({
    findLastInteractionInWithContent,
    countInteractionsByMonth,
    countPendingInteraction,
    countPendingInteractionsIn,
    countVisiteOut,
    updateInteractionAfterDistribution,
    totalInteractionAllUsagersStructure,
    findLastInteractionOut,
    totalInteractionsInPeriod,
  });

async function updateInteractionAfterDistribution(
  usager: Usager,
  interaction: CommonInteraction,
  oppositeType: InteractionType
): Promise<void> {
  await interactionRepository.update(
    {
      usagerUUID: usager.uuid,
      type: oppositeType,
      interactionOutUUID: IsNull(),
    },
    {
      interactionOutUUID: interaction.uuid,
    }
  );
}

async function findLastInteractionInWithContent({
  user,
  usager,
  oppositeType,
}: {
  user: Pick<UserStructureAuthenticated, "structureId">;
  usager: Pick<Usager, "uuid">;
  oppositeType: InteractionType;
}): Promise<CommonInteraction> {
  const lastInteractions = await interactionRepository.findOne({
    where: {
      structureId: user.structureId,
      usagerUUID: usager.uuid,
      type: oppositeType,
    },
    order: { dateInteraction: "DESC" },
  });

  return lastInteractions ?? undefined;
}

async function countPendingInteraction({
  structureId,
  usagerUUID,
  interactionType,
}: {
  structureId: number;
  usagerUUID: string;
  interactionType: InteractionType;
}): Promise<number> {
  // NOTE: cette requête ne renvoit pas de résultats pour les usagers de cette structure qui n'ont pas d'interaction
  const results:
    | {
        total: string;
      }
    | undefined = await interactionRepository
    .createQueryBuilder("interactions")
    .select(`SUM("nbCourrier")`, "total")
    .where({
      structureId,
      type: interactionType,
      usagerUUID,
      interactionOutUUID: IsNull(),
    })
    .groupBy(`"usagerUUID"`)
    .getRawOne();

  return results?.total ? parseInt(results?.total, 10) : 0;
}

async function countPendingInteractionsIn({
  usager,
}: {
  usager: Pick<Usager, "uuid" | "options" | "decision">;
}): Promise<{
  courrierIn: number;
  recommandeIn: number;
  colisIn: number;
}> {
  // NOTE: cette requête ne renvoit pas de résultats pour les usagers de cette structure qui n'ont pas d'interaction
  const results: {
    courrierIn: string;
    recommandeIn: string;
    colisIn: string;
  } = await interactionRepository
    .createQueryBuilder("interactions")
    .select(
      `coalesce (SUM(CASE WHEN type = 'courrierIn' THEN "nbCourrier" END), 0) AS "courrierIn"`
    )
    .addSelect(
      `coalesce (SUM(CASE WHEN type = 'recommandeIn' THEN "nbCourrier" END), 0) AS "recommandeIn"`
    )
    .addSelect(
      `coalesce (SUM(CASE WHEN type = 'colisIn' THEN "nbCourrier" END), 0) AS "colisIn"`
    )
    .where({ usagerUUID: usager.uuid, interactionOutUUID: IsNull() })
    .getRawOne();
  return {
    courrierIn: parseInt(results.courrierIn, 10),
    recommandeIn: parseInt(results.recommandeIn, 10),
    colisIn: parseInt(results.colisIn, 10),
  };
}

async function countInteractionsByMonth(
  regionId?: string,
  interactionType: InteractionType = "courrierOut"
) {
  const { startDate, endDate } = getDateForMonthInterval();

  const where: string[] = [interactionType, startDate, endDate];

  let query = `select date_trunc('month', "dateInteraction") as date,
    SUM("nbCourrier") as count
    FROM interactions i
    WHERE "type" = $1 and "dateInteraction" BETWEEN $2 AND $3 `;

  if (regionId) {
    query =
      query +
      ` and "structureId" in (select id from "structure" s where "region"=$4)`;

    where.push(regionId);
  }

  query = query + ` GROUP BY 1`;
  return interactionRepository.query(query, where);
}

async function countVisiteOut({
  dateInteractionAfter,
  dateInteractionBefore,
  structureId,
}: {
  dateInteractionAfter: Date;
  dateInteractionBefore: Date;
  structureId: number;
}): Promise<number> {
  // Première requête : rassemble les interactions sortantes par minute pour rassembler les éventuelles erreurs
  // Deuxième requête : On fait la somme de toutes ces interactions
  const query = `
  WITH visite_out_counts_by_minute(minute, minute_col_count) AS (
    SELECT  date_trunc('minute', "dateInteraction"), 1
      FROM interactions as i
      WHERE "structureId" = $1
      AND "dateInteraction" BETWEEN $2 AND $3
      AND  i.type in ('courrierOut', 'colisOut', 'recommandeOut')
    GROUP BY date_trunc('minute', "dateInteraction"))
    SELECT SUM(minute_col_count) as "visiteOut"
    FROM visite_out_counts_by_minute
  `;

  const res = await interactionRepository.query(query, [
    structureId,
    dateInteractionAfter.toDateString(),
    dateInteractionBefore.toDateString(),
  ]);

  if (res.length > 0) {
    return res[0].visiteOut ? parseInt(res[0].visiteOut, 10) : 0;
  }
  return 0;
}

async function totalInteractionAllUsagersStructure({
  structureId,
}: {
  structureId: number;
}): Promise<StructureStatsQuestionsInPeriodInteractions[]> {
  // NOTE: cette requête ne renvoit pas de résultats pour les usagers de cette structure qui n'ont pas d'interaction
  const query = `SELECT
      i."usagerRef",
      coalesce (COUNT(CASE WHEN i.type = 'appel' THEN 1 END), 0) AS "appel",
      coalesce (COUNT(CASE WHEN i.type = 'visite' THEN 1 END), 0) AS "visite",
      coalesce (SUM(CASE WHEN i.type = 'courrierIn' THEN "nbCourrier" END), 0) AS "courrierIn",
      coalesce (SUM(CASE WHEN i."returnToSender" is null and i.type = 'courrierOut' THEN "nbCourrier" END), 0) AS "courrierOut",
      coalesce (SUM(CASE WHEN i."returnToSender" is true AND i.type = 'courrierOut' THEN "nbCourrier" END), 0) AS "courrierOutForwarded",
      coalesce (SUM(CASE WHEN i.type = 'recommandeIn' THEN "nbCourrier" END), 0) AS "recommandeIn",
      coalesce (SUM(CASE WHEN i."returnToSender" is null and i.type = 'recommandeOut' THEN "nbCourrier" END), 0) AS "recommandeOut",
      coalesce (SUM(CASE WHEN i."returnToSender" is true AND i.type = 'recommandeOut' THEN "nbCourrier" END), 0) AS "recommandeOutForwarded",
      coalesce (SUM(CASE WHEN i.type = 'colisIn' THEN "nbCourrier" END), 0) AS "colisIn",
      coalesce (SUM(CASE WHEN i."returnToSender" is null and i.type = 'colisOut' THEN "nbCourrier" END), 0) AS "colisOut",
      coalesce (SUM(CASE WHEN i."returnToSender" is true AND i.type = 'colisOut' THEN "nbCourrier" END), 0) AS "colisOutForwarded"
    FROM interactions i
    WHERE i."structureId" = $1
    GROUP BY i."usagerRef"`;

  const results = await interactionRepository.query(query, [structureId]);

  return results.map(
    (x: {
      usagerRef: string;
      appel: string;
      visite: string;
      courrierIn: string;
      courrierOut: string;
      courrierOutForwarded: string;
      recommandeIn: string;
      recommandeOut: string;
      recommandeOutForwarded: string;
      colisIn: string;
      colisOut: string;
      colisOutForwarded: string;
    }) => ({
      usagerRef: parseInt(x.usagerRef, 10),
      courrierIn: parseInt(x.courrierIn, 10),
      courrierOut: parseInt(x.courrierOut, 10),
      courrierOutForwarded: parseInt(x.courrierOutForwarded, 10),
      recommandeIn: parseInt(x.recommandeIn, 10),
      recommandeOut: parseInt(x.recommandeOut, 10),
      recommandeOutForwarded: parseInt(x.recommandeOutForwarded, 10),
      colisIn: parseInt(x.colisIn, 10),
      colisOut: parseInt(x.colisOut, 10),
      colisOutForwarded: parseInt(x.colisOutForwarded, 10),
      appel: parseInt(x.appel, 10),
      visite: parseInt(x.visite, 10),
      loginPortai: 0,
    })
  );
}

async function totalInteractionsInPeriod({
  structureId,
  dateInteractionBefore,
  dateInteractionAfter,
}: {
  structureId: number;
  dateInteractionBefore: Date;
  dateInteractionAfter: Date;
}): Promise<{
  appel: number;
  visite: number;
  courrierIn: number;
  courrierOut: number;
  courrierOutForwarded: number;
  recommandeIn: number;
  recommandeOut: number;
  recommandeOutForwarded: number;
  colisIn: number;
  colisOut: number;
  colisOutForwarded: number;
}> {
  // NOTE: cette requête ne renvoit pas de résultats pour les usagers de cette structure qui n'ont pas d'interaction
  const query = `SELECT
  coalesce (COUNT(CASE WHEN i.type = 'appel' THEN 1 END), 0) AS "appel",
  coalesce (COUNT(CASE WHEN i.type = 'visite' THEN 1 END), 0) AS "visite",
  coalesce (SUM(CASE WHEN i.type = 'courrierIn' THEN "nbCourrier" END), 0) AS "courrierIn",
  coalesce (SUM(CASE WHEN i."returnToSender" is null AND i.type = 'courrierOut' THEN "nbCourrier" END), 0) AS "courrierOut",
  coalesce (SUM(CASE WHEN  i."returnToSender" is true AND i.type = 'courrierOut' THEN "nbCourrier" END), 0) AS "courrierOutForwarded",
  coalesce (SUM(CASE WHEN i.type = 'recommandeIn' THEN "nbCourrier" END), 0) AS "recommandeIn",
  coalesce (SUM(CASE WHEN i."returnToSender" is null AND i.type = 'recommandeOut' THEN "nbCourrier" END), 0) AS "recommandeOut",
  coalesce (SUM(CASE WHEN  i."returnToSender" is true AND i.type = 'recommandeOut' THEN "nbCourrier" END), 0) AS "recommandeOutForwarded",
  coalesce (SUM(CASE WHEN i.type = 'colisIn' THEN "nbCourrier" END), 0) AS "colisIn",
  coalesce (SUM(CASE WHEN i."returnToSender" is null AND i.type = 'colisOut' THEN "nbCourrier" END), 0) AS "colisOut",
  coalesce (SUM(CASE WHEN  i."returnToSender" is true AND i.type = 'colisOut' THEN "nbCourrier" END), 0) AS "colisOutForwarded"
    FROM interactions i
    WHERE i."structureId" = $1
    AND i."dateInteraction" >= $2
    AND i."dateInteraction" <  $3`;

  const rawResults = await interactionRepository.query(query, [
    structureId,
    dateInteractionAfter,
    dateInteractionBefore,
  ]);

  if (rawResults.length === 1) {
    const results = rawResults[0];

    return {
      courrierIn: parseInt(results.courrierIn, 10),
      courrierOut: parseInt(results.courrierOut, 10),
      courrierOutForwarded: parseInt(results.courrierOutForwarded, 10),
      recommandeIn: parseInt(results.recommandeIn, 10),
      recommandeOut: parseInt(results.recommandeOut, 10),
      recommandeOutForwarded: parseInt(results.recommandeOutForwarded, 10),
      colisIn: parseInt(results.colisIn, 10),
      colisOut: parseInt(results.colisOut, 10),
      colisOutForwarded: parseInt(results.colisOutForwarded, 10),
      appel: parseInt(results.appel, 10),
      visite: parseInt(results.visite, 10),
    };
  }
  return {
    courrierIn: 0,
    courrierOut: 0,
    courrierOutForwarded: 0,
    recommandeIn: 0,
    recommandeOut: 0,
    recommandeOutForwarded: 0,
    colisIn: 0,
    colisOut: 0,
    colisOutForwarded: 0,
    appel: 0,
    visite: 0,
  };
}

async function findLastInteractionOut(
  usager: Pick<Usager, "uuid">
): Promise<Pick<CommonInteraction, "uuid" | "dateInteraction"> | null> {
  return interactionRepository.findOne({
    where: {
      type: In(INTERACTION_OK_LIST),
      procuration: IsNull(),
      returnToSender: false,
      usagerUUID: usager.uuid,
    },
    select: {
      dateInteraction: true,
    },
    order: {
      dateInteraction: "DESC",
    },
  });
}
