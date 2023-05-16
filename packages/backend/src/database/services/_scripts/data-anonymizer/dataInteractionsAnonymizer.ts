import { interactionRepository } from "./../../interaction/interactionRepository.service";
import { appLogger } from "../../../../util";
import { fakerFR as faker } from "@faker-js/faker";

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
  return interactionRepository.update(
    typeOrmSearch<InteractionsTable>({
      content: Not(IsNull()),
    }),
    {
      content: "Random content",
      previousValue: null,
      userName: faker.person.fullName(),
    }
  );
}
