import { In } from "typeorm";
import { getDateForMonthInterval } from "../../../stats/services";
import { FranceRegion } from "../../../util/territoires";
import {
  Structure,
  Usager,
  UserStructureAuthenticated,
} from "../../../_common/model";
import {
  INTERACTION_OK_LIST,
  Interactions,
} from "../../../_common/model/interaction";
import { InteractionsTable } from "../../entities";
import { myDataSource } from "../_postgres";
import { InteractionType } from "@domifa/common";

export const interactionRepository = myDataSource
  .getRepository<Interactions>(InteractionsTable)
  .extend({
    findLastInteractionOk,
    findLastInteractionInWithContent,
    countInteractionsByMonth,
    countPendingInteraction,
    countPendingInteractionsIn,
    countVisiteOut,
    updateInteractionAfterDistribution,
    totalInteractionAllUsagersStructure,
  });

async function updateInteractionAfterDistribution(
  usager: Usager,
  interaction: Interactions,
  oppositeType: InteractionType
): Promise<void> {
  // Liste des interactions entrantes à mettre à jour
  return interactionRepository.query(
    `UPDATE interactions SET "interactionOutUUID" = $1 where "usagerUUID" = $2 AND type = $3 AND "interactionOutUUID" is null AND `,
    [interaction.uuid, usager.uuid, oppositeType]
  );
}

async function findLastInteractionOk({
  user,
  usager,
}: {
  user: Pick<UserStructureAuthenticated, "structureId">;
  usager: Pick<Usager, "ref">;
}): Promise<Interactions> {
  const lastInteractions = await interactionRepository.findOne({
    where: {
      structureId: user.structureId,
      usagerRef: usager.ref,
      type: In(INTERACTION_OK_LIST),
    },
    order: { dateInteraction: "DESC" },
  });

  return lastInteractions ?? undefined;
}

async function findLastInteractionInWithContent({
  user,
  usager,
  oppositeType,
}: {
  user: Pick<UserStructureAuthenticated, "structureId">;
  usager: Pick<Usager, "ref">;
  oppositeType: InteractionType;
}): Promise<Interactions> {
  const lastInteractions = await interactionRepository.findOne({
    where: {
      structureId: user.structureId,
      usagerRef: usager.ref,
      type: oppositeType,
    },
    order: { dateInteraction: "DESC" },
  });

  return lastInteractions ?? undefined;
}

async function countPendingInteraction({
  structureId,
  usagerRef,
  interactionType,
}: {
  structureId: number;
  usagerRef: number;
  interactionType: InteractionType;
}): Promise<number> {
  // NOTE: cette requête ne renvoit pas de résultats pour les usagers de cette structure qui n'ont pas d'interaction
  const query = `
    SELECT
      coalesce (SUM(CASE WHEN i.type = $1 THEN "nbCourrier" END), 0) AS "nbInteractions"
    FROM interactions i
    WHERE i."structureId" = $2 AND i."usagerRef" = $3 AND i."interactionOutUUID" is null
    GROUP BY i."usagerRef"`;
  const results = await interactionRepository.query(query, [
    interactionType,
    structureId,
    usagerRef,
  ]);

  return typeof results[0] === "undefined"
    ? 0
    : results[0] === null || results[0].length === 0
    ? 0
    : parseInt(results[0].nbInteractions, 10);
}

async function countPendingInteractionsIn({
  usagerUUID,
  structure,
}: {
  usagerUUID: string;
  structure: Pick<Structure, "portailUsager">;
}): Promise<{
  courrierIn: number;
  recommandeIn: number;
  colisIn: number;
  lastInteractionOut: Date | null;
}> {
  const INTERACTIONS_TO_CHECK = Object.assign([], INTERACTION_OK_LIST);

  if (structure.portailUsager.usagerLoginUpdateLastInteraction) {
    INTERACTIONS_TO_CHECK.push("loginPortail");
  }

  const inArray = INTERACTIONS_TO_CHECK.join(", ");

  // NOTE: cette requête ne renvoit pas de résultats pour les usagers de cette structure qui n'ont pas d'interaction
  const query = `SELECT
      coalesce (SUM(CASE WHEN i.type = 'courrierIn' THEN "nbCourrier" END), 0) AS "courrierIn",
      coalesce (SUM(CASE WHEN i.type = 'recommandeIn' THEN "nbCourrier" END), 0) AS "recommandeIn",
      coalesce (SUM(CASE WHEN i.type = 'colisIn' THEN "nbCourrier" END), 0) AS "colisIn",
      (SELECT "dateInteraction" from interactions where type IN($1) and "usagerUUID" = $2 ORDER BY "dateInteraction" DESC LIMIT 1) as "lastInteractionOut"
    FROM interactions i
    WHERE i."usagerUUID" = $2 AND i."interactionOutUUID" is null
    GROUP BY i."usagerRef"`;
  const results = await interactionRepository.query(query, [
    inArray,
    usagerUUID,
  ]);

  const defaultResult = {
    courrierIn: 0,
    recommandeIn: 0,
    colisIn: 0,
    lastInteractionOut: null,
  };

  if (typeof results[0] === "undefined") {
    return defaultResult;
  }

  if (results[0] === null || results[0].length === 0) {
    return defaultResult;
  }

  return {
    courrierIn: parseInt(results[0].courrierIn, 10),
    recommandeIn: parseInt(results[0].recommandeIn, 10),
    colisIn: parseInt(results[0].colisIn, 10),
    lastInteractionOut: results[0].lastInteractionOut,
  };
}

async function countInteractionsByMonth(
  regionId?: FranceRegion,
  interactionType: InteractionType = "courrierOut"
) {
  const { startDate, endDate } = getDateForMonthInterval();

  const where: string[] = [interactionType, startDate, endDate];

  let query = `select date_trunc('month', "dateInteraction") as date,
    SUM("nbCourrier") as count
    FROM interactions i
    WHERE "event"='create' and "type" = $1 and "dateInteraction" BETWEEN $2 AND $3 `;

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
      AND "event"='create'
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
}): Promise<
  {
    usagerRef: number;
    appel: number;
    visite: number;
    courrierIn: number;
    courrierOut: number;
    recommandeIn: number;
    recommandeOut: number;
    colisIn: number;
    colisOut: number;
    npai: number;
    loginPortail: number;
  }[]
> {
  // NOTE: cette requête ne renvoit pas de résultats pour les usagers de cette structure qui n'ont pas d'interaction
  const query = `SELECT
      i."usagerRef",
      coalesce (COUNT(CASE WHEN i.type = 'appel' THEN 1 END), 0) AS "appel",
      coalesce (COUNT(CASE WHEN i.type = 'visite' THEN 1 END), 0) AS "visite",
      coalesce (COUNT(CASE WHEN i.type = 'npai' THEN 1 END), 0) AS "npai",
      coalesce (COUNT(CASE WHEN i.type = 'loginPortail' THEN 1 END), 0) AS "loginPortail",
      coalesce (SUM(CASE WHEN i.type = 'courrierIn' THEN "nbCourrier" END), 0) AS "courrierIn",
      coalesce (SUM(CASE WHEN i.type = 'courrierOut' THEN "nbCourrier" END), 0) AS "courrierOut",
      coalesce (SUM(CASE WHEN i.type = 'recommandeIn' THEN "nbCourrier" END), 0) AS "recommandeIn",
      coalesce (SUM(CASE WHEN i.type = 'recommandeOut' THEN "nbCourrier" END), 0) AS "recommandeOut",
      coalesce (SUM(CASE WHEN i.type = 'colisIn' THEN "nbCourrier" END), 0) AS "colisIn",
      coalesce (SUM(CASE WHEN i.type = 'colisOut' THEN "nbCourrier" END), 0) AS "colisOut"
    FROM interactions i
    WHERE i."structureId" = $1
    GROUP BY i."usagerRef"`;

  const results = await interactionRepository.query(query, [structureId]);

  return results.map((x: any) => ({
    usagerRef: x.usagerRef,
    courrierIn: parseInt(x.courrierIn, 10),
    courrierOut: parseInt(x.courrierOut, 10),
    recommandeIn: parseInt(x.recommandeIn, 10),
    recommandeOut: parseInt(x.recommandeOut, 10),
    colisIn: parseInt(x.colisIn, 10),
    colisOut: parseInt(x.colisOut, 10),
    appel: parseInt(x.appel, 10),
    visite: parseInt(x.visite, 10),
    loginPortail: parseInt(x.loginPortail, 10),
    npai: parseInt(x.npai, 10),
  }));
}
