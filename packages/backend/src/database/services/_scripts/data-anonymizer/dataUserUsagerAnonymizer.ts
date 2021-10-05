import { INestApplication } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import { userStructureSecurityRepository, UserUsagerTable } from "../../..";
import { domifaConfig } from "../../../../config";
import { appLogger } from "../../../../util";
import { userStructureRepository } from "../../user-structure";
import { dataStructureAnonymizer } from "./dataStructureAnonymizer";

export const dataUserUsagerAnonymizer = {
  anonymizeUsersUsager,
};

type PartialUser = Pick<UserUsagerTable, "id" | "structureId">;

async function anonymizeUsersUsager({ app }: { app: INestApplication }) {
  const users = await userStructureRepository.findMany<PartialUser>(
    {},
    {
      select: ["id", "structureId", "email", "role"],
    }
  );

  // ignore domifa team tests users from anonymization
  const usersToAnonymise = users.filter((user) =>
    isUserUsagerToAnonymise(user)
  );

  appLogger.warn(
    `[dataUserAnonymizer] ${usersToAnonymise.length}/${users.length} users to anonymize`
  );
  for (const user of usersToAnonymise) {
    await _anonymizeUserUsager(user, { app });
  }
}
function isUserUsagerToAnonymise(
  user: Pick<UserUsagerTable, "id" | "structureId">
): unknown {
  return dataStructureAnonymizer.isStructureToAnonymise({
    id: user.structureId,
  });
}

async function _anonymizeUserUsager(
  user: PartialUser,
  { app }: { app: INestApplication }
) {
  // appLogger.debug(`[dataUserAnonymizer] check user "${user._id}"`);

  const passwordNonEncrypted = domifaConfig().dev.anonymizer.password;
  const password = passwordNonEncrypted
    ? await bcrypt.hash(passwordNonEncrypted, 10)
    : "";

  const attributesToUpdate: Partial<UserUsagerTable> = {
    password,
  };

  if (Object.keys(attributesToUpdate).length === 0) {
    // appLogger.debug(`[dataUserAnonymizer] nothing to update for "${user._id}"`);
    return user;
  }

  await userStructureSecurityRepository.updateOne(
    {
      userId: user.id,
    },
    {
      temporaryTokens: null,
      eventsHistory: [],
    }
  );

  return userStructureRepository.updateOne(
    {
      id: user.id,
    },
    attributesToUpdate
  );
}
