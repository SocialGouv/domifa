import { UserUsager } from "@domifa/common";
import {
  userUsagerSecurityRepository,
  userUsagerRepository,
} from "../../../../database";
import { passwordGenerator } from "../../../../util";
import {
  logUserSecurityEvent,
  userSecurityEventHistoryManager,
} from "../../../users/services";

export const userUsagerSecurityPasswordUpdater = {
  updatePassword,
};

async function updatePassword({
  userId,
  oldPassword,
  newPassword,
}: {
  userId: number;
  oldPassword: string;
  newPassword: string;
}): Promise<UserUsager> {
  const userSecurity = await userUsagerSecurityRepository.findOneOrFail({
    where: { userId },
  });

  if (
    userSecurityEventHistoryManager.isAccountLockedForOperation({
      operation: "change-password",
      ...userSecurity,
    })
  ) {
    throw new Error("Error");
  }
  const user = await userUsagerRepository.findOneByOrFail({
    id: userId,
  });
  const isValidPass: boolean = await passwordGenerator.checkPassword({
    password: oldPassword,
    hash: user.password,
  });
  if (!isValidPass) {
    await logUserSecurityEvent({
      userProfile: "usager",
      userId,
      userSecurity,
      eventType: "change-password-error",
    });
    throw new Error("Error");
  }

  const hash = await passwordGenerator.generatePasswordHash({
    password: newPassword,
  });

  await userUsagerRepository.update(
    { id: userId },
    { password: hash, passwordLastUpdate: new Date(), acceptTerms: new Date() }
  );

  const updatedUser = await userUsagerRepository.findOneBy({
    id: userId,
  });

  await logUserSecurityEvent({
    userProfile: "usager",
    userId,
    userSecurity,
    eventType: "change-password-success",
  });
  return updatedUser;
}
