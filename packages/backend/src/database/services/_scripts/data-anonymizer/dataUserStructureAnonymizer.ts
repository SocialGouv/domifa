import { usagerHistoryRepository } from "./../../usager/usagerHistoryRepository.service";
import { INestApplication } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import {
  monitoringBatchProcessRepository,
  userStructureSecurityRepository,
  UserStructureTable,
} from "../../..";
import { domifaConfig } from "../../../../config";
import { appLogger } from "../../../../util";
import { userStructureRepository } from "../../user-structure";
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

async function anonymizeUsersStructure({ app }: { app: INestApplication }) {
  appLogger.warn(`[ANON] [monitoringBatchProcessRepository] reset tables`);
  await monitoringBatchProcessRepository.deleteByCriteria({});
  appLogger.warn(`[ANON] [usagerHistoryRepository] reset tables`);
  await usagerHistoryRepository.deleteByCriteria({});
  appLogger.warn(`[ANON] [userStructureSecurityRepository] reset tables`);
  await userStructureSecurityRepository.deleteByCriteria({});

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
      await _anonymizeUserStructure(user, { app });
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

async function _anonymizeUserStructure(
  user: PartialUser,
  { app }: { app: INestApplication }
) {
  // appLogger.debug(`[dataUserAnonymizer] check user "${user._id}"`);

  const passwordNonEncrypted = domifaConfig().dev.anonymizer.password;
  const password = passwordNonEncrypted
    ? await bcrypt.hash(passwordNonEncrypted, 10)
    : "";

  const attributesToUpdate: Partial<UserStructureTable> = {
    nom: dataGenerator.lastName().toUpperCase(),
    prenom: dataGenerator.firstName(),
    password,
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
