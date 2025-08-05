import { UserSecurity } from "../../../_common/model";
import {
  userUsagerRepository,
  userUsagerSecurityRepository,
  UserUsagerTable,
} from "../../../database";
import { userUsagerLoginPasswordGenerator } from "./user-usager-login-password-generator.service";
import { Usager, UserStructure } from "@domifa/common";

export const userUsagerCreator = {
  createUserWithTmpPassword,
};

async function createUserWithTmpPassword(
  usager: Pick<Usager, "uuid" | "structureId" | "dateNaissance">,
  creator: Pick<UserStructure, "id" | "nom" | "prenom">
): Promise<{
  login: string;
  temporaryPassword: string;
  user: UserUsagerTable;
  userSecurity: UserSecurity;
}> {
  const login: string =
    await userUsagerLoginPasswordGenerator.generateUniqueLogin();

  const { salt, temporaryPassword, passwordHash } =
    await userUsagerLoginPasswordGenerator.generateTemporyPassword(
      usager.dateNaissance
    );

  const createdUser = new UserUsagerTable({
    structureId: usager.structureId,
    usagerUUID: usager.uuid,
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

  const userSecurityAttributes: UserSecurity = {
    userId: user.id,
    structureId: user.structureId,
    eventsHistory: [],
    temporaryTokens: {},
  };

  const userSecurity = await userUsagerSecurityRepository.save(
    userSecurityAttributes
  );
  return { login, temporaryPassword, user, userSecurity };
}
