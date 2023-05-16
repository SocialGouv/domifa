import { hash } from "bcryptjs";
import { monitoringBatchProcessRepository, UserStructureTable } from "../../..";
import { domifaConfig } from "../../../../config";
import { appLogger } from "../../../../util";
import {
  newUserStructureRepository,
  userStructureRepository,
  UserStructureSecurityRepository,
} from "../../user-structure";
import { dataEmailAnonymizer } from "./dataEmailAnonymizer";
import { dataGenerator } from "./dataGenerator.service";
import { dataStructureAnonymizer } from "./dataStructureAnonymizer";

export const dataUserStructureAnonymizer = {
  anonymizeUsersStructure,
};

type PartialUser = Pick<
  UserStructureTable,
  "id" | "structureId" | "email" | "role"
>;

async function anonymizeUsersStructure() {
  appLogger.warn(`[ANON] [monitoringBatchProcessRepository] reset tables`);
  await monitoringBatchProcessRepository.delete({});

  appLogger.warn(`[dataUserAnonymizer] [user-structure] reset security tables`);

  await UserStructureSecurityRepository.update(
    {},
    {
      temporaryTokens: null,
      eventsHistory: [],
    }
  );

  // Anonymisation de tous les mots de passe
  const passwordNonEncrypted = domifaConfig().dev.anonymizer.password;
  const password = passwordNonEncrypted
    ? await hash(passwordNonEncrypted, 10)
    : "";

  appLogger.warn(`[ANON] [userStructure] reset passwords`);
  await newUserStructureRepository
    .createQueryBuilder("structures")
    .update()
    .set({ password })
    .where(`"structureId" > 1`)
    .execute();

  const users = await userStructureRepository.findMany<PartialUser>(
    {},
    {
      select: ["id", "structureId", "email", "role"],
    }
  );

  // ignore domifa team tests users from anonymization
  const usersToAnonymise = users.filter((user) =>
    isUserStructureToAnonymise(user)
  );

  appLogger.warn(
    `[dataUserAnonymizer] ${usersToAnonymise.length}/${users.length} users structure to anonymize`
  );

  for (const user of usersToAnonymise) {
    try {
      await _anonymizeUserStructure(user);
    } catch (e) {
      console.log(e);
    }
  }
}

function isUserStructureToAnonymise(
  user: Pick<UserStructureTable, "id" | "structureId" | "email">
): unknown {
  return dataStructureAnonymizer.isStructureToAnonymise({
    id: user.structureId,
  });
}

async function _anonymizeUserStructure(user: PartialUser) {
  const attributesToUpdate: Partial<UserStructureTable> = {
    nom: dataGenerator.lastName().toUpperCase(),
    prenom: dataGenerator.firstName(),
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
    prefix: `${user.role}-${user.structureId}`,
    id: user.id,
  });

  if (Object.keys(attributesToUpdate).length === 0) {
    // appLogger.debug(`[dataUserAnonymizer] nothing to update for "${user._id}"`);
    return user;
  }

  return userStructureRepository.updateOne({ id: user.id }, attributesToUpdate);
}
