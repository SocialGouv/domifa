import {
  userUsagerRepository,
  userUsagerSecurityRepository,
  UserUsagerTable,
} from "../../database";
import {
  UserStructure,
  UserUsager,
  UserUsagerSecurity,
} from "../../_common/model";
import { userUsagerLoginPasswordGenerator } from "./user-usager-login-password-generator.service";

export const userUsagerCreator = {
  createUserWithTmpPassword,
};

async function createUserWithTmpPassword(
  userUsager: Pick<UserUsager, "usagerUUID" | "structureId">,
  { creator }: { creator: Pick<UserStructure, "id" | "nom" | "prenom"> }
): Promise<{
  login: string;
  temporaryPassword: string;
  user: UserUsagerTable;
  userSecurity: UserUsagerSecurity;
}> {
  let login: string =
    await userUsagerLoginPasswordGenerator.generateUniqueLogin();

  const { salt, temporaryPassword, passwordHash } =
    await userUsagerLoginPasswordGenerator.generateTemporyPassword();

  const createdUser = new UserUsagerTable({
    ...userUsager,
    login,
    password: passwordHash,
    salt,
    isTemporaryPassword: true,
    lastLogin: undefined,
    passwordLastUpdate: undefined,
    lastPasswordResetDate: new Date(),
    lastPasswordResetStructureUser: {
      userId: creator.id,
      userName: creator.prenom + " " + creator.nom,
    },
    enabled: true,
  });

  const user = await userUsagerRepository.save(createdUser);

  const userSecurityAttributes: UserUsagerSecurity = {
    userId: user.id,
    structureId: user.structureId,
    eventsHistory: [],
  };

  const userSecurity = await userUsagerSecurityRepository.save(
    userSecurityAttributes
  );
  return { login, temporaryPassword, user, userSecurity };
}
