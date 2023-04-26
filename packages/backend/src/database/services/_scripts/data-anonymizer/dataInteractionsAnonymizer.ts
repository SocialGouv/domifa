import { interactionRepository } from "./../../interaction/interactionRepository.service";
import { appLogger } from "../../../../util";

import { IsNull, Not } from "typeorm";
import { typeOrmSearch } from "../..";
import { InteractionsTable } from "../../..";

export const dateInteractionsAnonymizer = {
  anonymizeInteractions,
};

async function anonymizeInteractions() {
  appLogger.warn(
    `[dataInteractionsAnonymizer] Nettoyage du contenu des interactions`
  );

  // Liste des interactions entrantes à mettre à jour
  await interactionRepository.update(
    typeOrmSearch<InteractionsTable>({
      content: Not(IsNull()),
    }),
    { content: "Random content" }
  );
}
