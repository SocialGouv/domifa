import { In } from "typeorm";
import { AppAuthUser, Usager } from "../../../_common/model";
import {
  Interactions,
  INTERACTION_IN_OUT_LIST,
  INTERACTION_IN_OUT_OBJECTS,
  INTERACTION_OK_LIST,
} from "../../../_common/model/interaction";
import { InteractionsTable } from "../../entities";
import { pgRepository, typeOrmSearch } from "../_postgres";

const baseRepository =
  pgRepository.get<InteractionsTable, Interactions>(InteractionsTable);

export const interactionRepository = {
  ...baseRepository,
  findLastInteractionOk,
  findWithFilters,
};

async function findLastInteractionOk(
  user: Pick<AppAuthUser, "structureId">,
  usager: Pick<Usager, "ref">
): Promise<InteractionsTable[]> {
  return baseRepository.findMany(
    typeOrmSearch<InteractionsTable>({
      structureId: user.structureId,
      usagerRef: usager.ref,
      type: In(INTERACTION_OK_LIST),
    }),
    {
      order: {
        dateInteraction: "DESC",
      },
      skip: 1,
      maxResults: 2,
    }
  );
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
    search["type"] = In(INTERACTION_IN_OUT_LIST) as any;
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
