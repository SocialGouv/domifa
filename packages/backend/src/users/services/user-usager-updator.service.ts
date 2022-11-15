import { userUsagerRepository } from "../../database";
import { UserUsager } from "../../_common/model";
import { userUsagerLoginPasswordGenerator } from "./user-usager-login-password-generator.service";

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

  return { userUsager: updatedUser, temporaryPassword };
}