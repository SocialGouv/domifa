import { INestApplication } from "@nestjs/common";
import * as bcrypt from "bcryptjs";
import {
  userStructureSecurityRepository,
  userUsagerRepository,
  UserUsagerTable,
} from "../../..";
import { domifaConfig } from "../../../../config";
import { appLogger } from "../../../../util";

export const dataUserUsagerAnonymizer = {
  anonymizeUsersUsager,
};

type PartialUser = Pick<UserUsagerTable, "id" | "structureId">;

async function anonymizeUsersUsager({ app }: { app: INestApplication }) {
  appLogger.warn(`[dataUserAnonymizer] [user-usager] update of security table`);
  await userStructureSecurityRepository.updateMany(
    {},
    {
      temporaryTokens: null,
      eventsHistory: [],
    }
  );

  const passwordNonEncrypted = domifaConfig().dev.anonymizer.password;
  const password = passwordNonEncrypted
    ? await bcrypt.hash(passwordNonEncrypted, 10)
    : "";

  appLogger.warn(`[dataUserAnonymizer] [user-usager] update passwords`);
  return userUsagerRepository.updateMany<PartialUser>(
    {},
    {
      password,
      lastPasswordResetStructureUser: {
        userId: 1,
        userName: "Nom",
      },
    }
  );
}
