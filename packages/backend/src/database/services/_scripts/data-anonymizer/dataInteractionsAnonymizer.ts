import { interactionRepository } from "./../../interaction/interactionRepository.service";
import { appLogger } from "../../../../util";
import { fakerFR as faker } from "@faker-js/faker";

import { IsNull, Not } from "typeorm";

export const dateInteractionsAnonymizer = {
  anonymizeInteractions,
};

async function anonymizeInteractions() {
  appLogger.warn(
    `[dataInteractionsAnonymizer] Nettoyage du contenu des interactions`
  );
  return interactionRepository.update(
    {
      content: Not(IsNull()),
    },
    {
      content: "Random content",
      userName: faker.person.fullName(),
    }
  );
}
