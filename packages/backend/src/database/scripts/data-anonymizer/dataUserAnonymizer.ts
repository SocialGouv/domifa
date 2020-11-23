import { INestApplication } from "@nestjs/common";
import { AppUserTable } from "../../../users/pg";
import { usersRepository } from "../../../users/pg/users-repository.service";
import { appLogger } from "../../../util";
import { dataEmailAnonymizer } from "./dataEmailAnonymizer";
import { dataGenerator } from "./dataGenerator.service";

export const dataUserAnonymizer = {
  anonymizeUsers,
};

type PartialUser = Pick<AppUserTable, "id" | "email">;

async function anonymizeUsers({ app }: { app: INestApplication }) {
  const users = await usersRepository.findMany<PartialUser>(
    {},
    {
      select: ["id", "email"],
    }
  );

  // ignore domifa team tests users from anonymization
  const usersToAnonymise = users.filter((user) =>
    dataEmailAnonymizer.isEmailToAnonymize(user.email)
  );

  appLogger.warn(
    `[dataUserAnonymizer] ${usersToAnonymise.length}/${users.length} users to anonymize`
  );
  for (const user of usersToAnonymise) {
    await _anonymizeUser(user, { app });
  }
}
async function _anonymizeUser(
  user: PartialUser,
  { app }: { app: INestApplication }
) {
  // appLogger.debug(`[dataUserAnonymizer] check user "${user._id}"`);

  const attributesToUpdate: Partial<AppUserTable> = {
    nom: dataGenerator.lastName().toUpperCase(),
    prenom: dataGenerator.firstName(),
    password: "",
    temporaryTokens: null,
    fonction: dataGenerator.fromList([
      "Agent administratif",
      "Agent d'accueil",
      "Educateur Spécialisé",
      "Président",
      "Responsable de service",
      "Travailleur social",
      null,
      null,
      null,
    ]),
  };

  if (dataEmailAnonymizer.isEmailToAnonymize(user.email)) {
    attributesToUpdate.email = dataEmailAnonymizer.anonymizeEmail({
      prefix: "user",
      id: user.id,
    });
  }

  if (Object.keys(attributesToUpdate).length === 0) {
    // appLogger.debug(`[dataUserAnonymizer] nothing to update for "${user._id}"`);
    return user;
  }

  return usersRepository.updateOne(
    {
      id: user.id,
    },
    attributesToUpdate
  );
}
