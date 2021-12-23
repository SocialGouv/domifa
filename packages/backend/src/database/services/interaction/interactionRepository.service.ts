import moment = require("moment");
import { FindConditions, In, LessThan, MoreThan } from "typeorm";
import {
  Usager,
  UserStructure,
  UserStructureAuthenticated,
} from "../../../_common/model";
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

export const interactionRepository = {
  ...baseRepository,
  findLastInteraction,
  findLastInteractionOk,
  findLastInteractionInWithContent,
  findWithFilters,
  countInteractionsByMonth,
  countPendingInteraction,
  countPendingInteractionsIn,
};

async function findLastInteraction({
  usagerRef,
  dateInteraction,
  typeInteraction,
  user,
  isIn,
  event,
}: {
  usagerRef: number;
  dateInteraction: Date;
  typeInteraction: InteractionType;
  user: Pick<UserStructure, "structureId">;
  isIn: string;
  event: InteractionEvent;
}): Promise<Interactions | null> {
  const dateQuery =
    isIn === "out" ? LessThan(dateInteraction) : MoreThan(dateInteraction);

  const where: FindConditions<InteractionsTable> = {
    structureId: user.structureId,
    usagerRef,
    type: typeInteraction,
    dateInteraction: dateQuery,
    event,
  };
  return interactionRepository.findOne(where as any);
}

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
  const results = await (
    await interactionRepository.typeorm()
  ).query(query, [interactionType, structureId, usagerRef]);

  return typeof results[0] === "undefined"
    ? 0
    : parseInt(results[0].nbInteractions, 10);
}

async function countPendingInteractionsIn({
  structureId,
  usagerRef,
}: {
  structureId: number;
  usagerRef: number;
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
    WHERE i."structureId" = $1 AND i."usagerRef" = $2 and i.event = 'create' AND i."interactionOutUUID" is null
    GROUP BY i."usagerRef"`;
  const results = await (
    await interactionRepository.typeorm()
  ).query(query, [structureId, usagerRef]);

  if (typeof results[0] === "undefined") {
    return {
      courrierIn: 0,
      recommandeIn: 0,
      colisIn: 0,
    };
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
  const interactions = await interactionRepository.findMany(search, {
    order: {
      dateInteraction: "DESC",
    },
    skip: 0,
    maxResults,
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
  const startDate = postgresQueryBuilder.formatPostgresDate(
    moment()
      .utc()
      .subtract(2, "month")
      .subtract(1, "year")
      .endOf("month")
      .toDate()
  );

  const where: string[] = [startDate, interactionType];

  let query = `select date_trunc('month', "dateInteraction") as date,
    SUM("nbCourrier") as count
    FROM interactions i
    WHERE "createdAt" > $1 AND "type" = $2`;

  if (regionId) {
    query =
      query +
      ` and "structureId" in (select id from "structure" s where "region"=$3)`;

    where.push(regionId);
  }

  query = query + ` GROUP BY 1`;

  return appTypeormManager.getRepository(InteractionsTable).query(query, where);
}
