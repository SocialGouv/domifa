import { UserSecurity } from "../../../_common/model";
import {
  userUsagerRepository,
  userUsagerSecurityRepository,
  UserUsagerTable,
} from "../../../database";
import { logSecurityEventForUser } from "../../app-logs/app-log-security-writer";
import { userUsagerLoginPasswordGenerator } from "./user-usager-login-password-generator.service";
import { Usager, UserStructure, UserUsager } from "@domifa/common";

export const userUsagerCreator = {
  createUserWithTmpPassword,
  resetUserUsagerPassword,
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

  const { salt, temporaryPassword, passwordHash, passwordType } =
    await userUsagerLoginPasswordGenerator.generateTemporyPassword(usager);

  const createdUser = new UserUsagerTable({
    structureId: usager.structureId,
    usagerUUID: usager.uuid,
    login,
    password: passwordHash,
    salt,
    passwordType,
    lastLogin: undefined,
    passwordLastUpdate: undefined,
    lastPasswordResetDate: new Date(),
    lastPasswordResetStructureUser: {
      userId: creator.id,
      userName: creator.prenom + " " + creator.nom,
    },
  });

  const user = await userUsagerRepository.save(createdUser);

  const userSecurityAttributes: UserSecurity = {
    userId: user.id,
    structureId: user.structureId,
    temporaryTokens: {},
  };

  const userSecurity = await userUsagerSecurityRepository.save(
    userSecurityAttributes
  );
  return { login, temporaryPassword, user, userSecurity };
}

async function resetUserUsagerPassword(
  usager: Pick<Usager, "uuid" | "dateNaissance">
): Promise<{ userUsager: UserUsager; temporaryPassword: string }> {
  let temporaryPassword = "";

  const {
    salt,
    temporaryPassword: tp,
    passwordHash,
    passwordType,
  } = await userUsagerLoginPasswordGenerator.generateTemporyPassword(usager);
  temporaryPassword = tp;

  await userUsagerRepository.update(
    { usagerUUID: usager.uuid },
    {
      salt,
      password: passwordHash,
      passwordType,
    }
  );

  const updatedUser = await userUsagerRepository.findOneByOrFail({
    usagerUUID: usager.uuid,
  });

  await logSecurityEventForUser(
    "RESET_PASSWORD_SUCCESS",
    "usager",
    updatedUser
  );

  return { userUsager: updatedUser, temporaryPassword };
}
