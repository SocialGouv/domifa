import { UserUsager } from "@domifa/common";
import {
  userUsagerRepository,
  userUsagerSecurityRepository,
} from "../../../database";

import { userUsagerLoginPasswordGenerator } from "./user-usager-login-password-generator.service";
import { logUserSecurityEvent } from "../../users/services";

export const userUsagerUpdator = {
  disableUser,
  enableUser,
};

async function disableUser({
  usagerUUID,
}: {
  usagerUUID: string;
}): Promise<void> {
  await userUsagerRepository.update({ usagerUUID }, { enabled: false });
}

async function enableUser({
  usagerUUID,
  generateNewPassword,
}: {
  usagerUUID: string;
  generateNewPassword: boolean;
}): Promise<{ userUsager: UserUsager; temporaryPassword: string }> {
  let temporaryPassword = "";
  const attributes: Partial<UserUsager> = {
    enabled: true,
  };
  if (generateNewPassword) {
    const {
      salt,
      temporaryPassword: tp,
      passwordHash,
    } = await userUsagerLoginPasswordGenerator.generateTemporyPassword();
    temporaryPassword = tp;
    attributes.salt = salt;
    attributes.password = passwordHash;
    attributes.isTemporaryPassword = true;
  }

  await userUsagerRepository.update({ usagerUUID }, attributes);

  const updatedUser = await userUsagerRepository.findOneByOrFail({
    usagerUUID,
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
