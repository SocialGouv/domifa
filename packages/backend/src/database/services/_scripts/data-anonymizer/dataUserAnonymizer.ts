import { INestApplication } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { AppUserTable } from "../../..";
import { domifaConfig } from "../../../../config";
import { appLogger } from "../../../../util";
import { usersRepository } from "../../app-user/users-repository.service";
import { dataEmailAnonymizer } from "./dataEmailAnonymizer";
import { dataGenerator } from "./dataGenerator.service";
import { dataStructureAnonymizer } from "./dataStructureAnonymizer";

export const dataUserAnonymizer = {
  anonymizeUsers,
};

type PartialUser = Pick<AppUserTable, "id" | "structureId" | "email">;

async function anonymizeUsers({ app }: { app: INestApplication }) {
  const users = await usersRepository.findMany<PartialUser>(
    {},
    {
      select: ["id", "structureId", "email"],
    }
  );

  // ignore domifa team tests users from anonymization
  const usersToAnonymise = users.filter((user) => isUserToAnonymise(user));

  appLogger.warn(
    `[dataUserAnonymizer] ${usersToAnonymise.length}/${users.length} users to anonymize`
  );
  for (const user of usersToAnonymise) {
    await _anonymizeUser(user, { app });
  }
}
function isUserToAnonymise(
  user: Pick<AppUserTable, "id" | "structureId" | "email">
): unknown {
  return dataStructureAnonymizer.isStructureToAnonymise({
    id: user.structureId,
  });
}

async function _anonymizeUser(
  user: PartialUser,
  { app }: { app: INestApplication }
) {
  // appLogger.debug(`[dataUserAnonymizer] check user "${user._id}"`);

  const passwordNonEncrypted = domifaConfig().dev.anonymizer.password;
  const password = passwordNonEncrypted
    ? await bcrypt.hash(passwordNonEncrypted, 10)
    : "";

  const attributesToUpdate: Partial<AppUserTable> = {
    nom: dataGenerator.lastName().toUpperCase(),
    prenom: dataGenerator.firstName(),
    password,
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

  attributesToUpdate.email = dataEmailAnonymizer.anonymizeEmail({
    prefix: "user",
    id: user.id,
  });

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
