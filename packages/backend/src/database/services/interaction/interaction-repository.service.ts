import { Interactions } from "../../../_common/model/interaction";
import { InteractionsTable } from "../../entities";
import { pgRepository, typeOrmSearch } from "../_postgres";
import { In } from "typeorm";
import { AppAuthUser, Usager } from "../../../_common/model";

const baseRepository = pgRepository.get<InteractionsTable, Interactions>(
  InteractionsTable
);

export const interactionRepository = {
  ...baseRepository,
  findLastInteractionOk,
};

async function findLastInteractionOk(
  user: Pick<AppAuthUser, "structureId">,
  usager: Pick<Usager, "ref">
): Promise<InteractionsTable[]> {
  return baseRepository.findMany(
    typeOrmSearch<InteractionsTable>({
      structureId: user.structureId,
      usagerRef: usager.ref,
      type: In(["courrierOut", "visite", "appel", "colisOut", "recommandeOut"]),
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
