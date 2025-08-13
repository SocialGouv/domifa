import { UserSecurity } from "../../../_common/model";
import {
  userUsagerRepository,
  userUsagerSecurityRepository,
  UserUsagerTable,
} from "../../../database";
import { logUserSecurityEvent } from "../../users/services";
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

  const { salt, temporaryPassword, passwordHash, isBirthDate } =
    await userUsagerLoginPasswordGenerator.generateTemporyPassword(usager);

  const createdUser = new UserUsagerTable({
    structureId: usager.structureId,
    usagerUUID: usager.uuid,
    login,
    password: passwordHash,
    salt,
    isTemporaryPassword: true,
    lastLogin: undefined,
    passwordLastUpdate: undefined,
    isBirthDate,
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
    eventsHistory: [],
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
    isBirthDate,
  } = await userUsagerLoginPasswordGenerator.generateTemporyPassword(usager);
  temporaryPassword = tp;

  await userUsagerRepository.update(
    { usagerUUID: usager.uuid },
    {
      salt,
      password: passwordHash,
      isTemporaryPassword: true,
      isBirthDate,
    }
  );

  const updatedUser = await userUsagerRepository.findOneByOrFail({
    usagerUUID: usager.uuid,
  });

  const userSecurity = await userUsagerSecurityRepository.findOneByOrFail({
    userId: updatedUser.id,
  });

  await logUserSecurityEvent({
    userProfile: "usager",
    userId: updatedUser.id,
    userSecurity,
    eventType: "reset-password-success",
    clearAllEvents: true,
  });

  return { userUsager: updatedUser, temporaryPassword };
}
