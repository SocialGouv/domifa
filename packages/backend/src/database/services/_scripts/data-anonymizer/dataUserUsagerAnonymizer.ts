import * as bcrypt from "bcryptjs";
import {
  UserStructureSecurityRepository,
  userUsagerRepository,
} from "../../..";
import { domifaConfig } from "../../../../config";
import { appLogger } from "../../../../util";

export const dataUserUsagerAnonymizer = {
  anonymizeUsersUsager,
};

async function anonymizeUsersUsager(): Promise<void> {
  appLogger.warn(`[dataUserAnonymizer] [user-usager] update of security table`);
  await UserStructureSecurityRepository.update(
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
  await userUsagerRepository.update(
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
