import { startOfMonth, subYears } from "date-fns";

import { In } from "typeorm";
import { domifaConfig } from "../../../config";
import { Usager, UserStructureAuthenticated } from "../../../_common/model";
import {
  InteractionEvent,
  Interactions,
  InteractionType,
  INTERACTION_IN_OUT_LIST,
  INTERACTION_IN_OUT_OBJECTS,
  INTERACTION_OK_LIST,
} from "../../../_common/model/interaction";
import { InteractionsTable } from "../../entities";
import {
  appTypeormManager,
  pgRepository,
  postgresQueryBuilder,
  typeOrmSearch,
} from "../_postgres";

const baseRepository = pgRepository.get<InteractionsTable, Interactions>(
  InteractionsTable
);

export const interactionRepository = appTypeormManager
  .getRepository(InteractionsTable)
  .extend({
    aggregateAsNumber: baseRepository.aggregateAsNumber,
    findLastInteractionOk,
    findLastInteractionInWithContent,
    findWithFilters,
    countInteractionsByMonth,
    countPendingInteraction,
    countPendingInteractionsIn,
    countVisiteOut,
  });

async function findLastInteractionOk({
  user,
  usager,
  event,
}: {
  user: Pick<UserStructureAuthenticated, "structureId">;
  usager: Pick<Usager, "ref">;
  event: InteractionEvent;
}): Promise<Interactions> {
  const lastInteractions = await baseRepository.findMany(
    typeOrmSearch<InteractionsTable>({
      structureId: user.structureId,
      usagerRef: usager.ref,
      type: In(INTERACTION_OK_LIST),
      event,
    }),
    {
      order: {
        dateInteraction: "DESC",
      },
      maxResults: 1,
    }
  );

  return lastInteractions?.length > 0 ? lastInteractions[0] : undefined;
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
  const lastInteractions = await baseRepository.findMany(
    typeOrmSearch<InteractionsTable>({
      structureId: user.structureId,
      usagerRef: usager.ref,
      type: oppositeType,
      event: "create",
    }),
    {
      order: {
        dateInteraction: "DESC",
      },
      maxResults: 1,
    }
  );
  return lastInteractions?.length > 0 ? lastInteractions[0] : undefined;
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
    WHERE i."structureId" = $2 AND i."usagerRef" = $3 and i.event = 'create' AND i."interactionOutUUID" is null
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
}: {
  usagerUUID: string;
}): Promise<{
  courrierIn: number;
  recommandeIn: number;
  colisIn: number;
}> {
  // NOTE: cette requête ne renvoit pas de résultats pour les usagers de cette structure qui n'ont pas d'interaction
  const query = `SELECT
      coalesce (SUM(CASE WHEN i.type = 'courrierIn' THEN "nbCourrier" END), 0) AS "courrierIn",
      coalesce (SUM(CASE WHEN i.type = 'recommandeIn' THEN "nbCourrier" END), 0) AS "recommandeIn",
      coalesce (SUM(CASE WHEN i.type = 'colisIn' THEN "nbCourrier" END), 0) AS "colisIn"
    FROM interactions i
    WHERE i."usagerUUID" = $1 and i.event = 'create' AND i."interactionOutUUID" is null
    GROUP BY i."usagerRef"`;
  const results = await interactionRepository.query(query, [usagerUUID]);

  const defaultResult = {
    courrierIn: 0,
    recommandeIn: 0,
    colisIn: 0,
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
  };
}

async function findWithFilters({
  usagerRef,
  structureId,
  filter,
  maxResults,
}: {
  usagerRef: number;
  structureId: number;
  filter?: "distribution";
  maxResults?: number;
}): Promise<any> {
  const search: Partial<InteractionsTable> = { structureId, usagerRef };

  if (filter === "distribution") {
    search.type = In(INTERACTION_IN_OUT_LIST) as any;
  }

  const interactions = await interactionRepository.find({
    where: search,
    order: {
      dateInteraction: "DESC",
    },
    skip: 0,
    take: maxResults,
  });

  if (filter === "distribution") {
    const distributionProgress = INTERACTION_IN_OUT_OBJECTS.map((io) => ({
      ...io,
      outFound: false,
    }));

    const interactionsToDistribute: Interactions[] = [];

    for (const interaction of interactions) {
      const interationIn = distributionProgress.find(
        (io) => io.in === interaction.type
      );
      if (interationIn) {
        // interaction entrante, et pas encore d'interaction sortante équivalente de rencontrée
        if (!interationIn.outFound) {
          interactionsToDistribute.push(interaction);
        }
      } else {
        const interationOut = distributionProgress.find(
          (io) => io.out === interaction.type
        );
        if (interationOut) {
          // interaction sortante: on exclue les interactions suivantes de ce type
          interationOut.outFound = true;
        }
      }
    }

    return interactionsToDistribute;
  }

  return interactions;
}

async function countInteractionsByMonth(
  regionId?: string,
  interactionType: InteractionType = "courrierOut"
) {
  const dateRef =
    domifaConfig().envId === "test" ? new Date("2022-07-31") : new Date();

  const startInterval = postgresQueryBuilder.formatPostgresDate(
    startOfMonth(subYears(dateRef, 1))
  );
  const endInterval = postgresQueryBuilder.formatPostgresDate(
    startOfMonth(dateRef)
  );

  const where: string[] = [startInterval, endInterval, interactionType];

  let query = `select date_trunc('month', "dateInteraction") as date,
    SUM("nbCourrier") as count
    FROM interactions i
    WHERE i."createdAt"::date > $1 AND i."createdAt"::date < $2 AND "type" = $3`;

  if (regionId) {
    query =
      query +
      ` and "structureId" in (select id from "structure" s where "region"=$4)`;

    where.push(regionId);
  }

  query = query + ` GROUP BY 1 ORDER BY date ASC`;
  return appTypeormManager.getRepository(InteractionsTable).query(query, where);
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
      WHERE "structureId" = ${structureId}
      AND "event"='create'
      AND "dateInteraction" BETWEEN '${dateInteractionAfter.toDateString()}' AND '${dateInteractionBefore.toDateString()}'
      AND  i.type in ('courrierOut', 'colisOut', 'recommandeOut')
    GROUP BY date_trunc('minute', "dateInteraction"))
    SELECT SUM(minute_col_count) as "visiteOut"
    FROM visite_out_counts_by_minute
  `;

  const res = await appTypeormManager
    .getRepository(InteractionsTable)
    .query(query);

  if (res.length > 0) {
    return res[0].visiteOut ? parseInt(res[0].visiteOut, 10) : 0;
  }
  return 0;
}
