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
import { terminateUserSession } from "../../../users/services/userSessionTerminator.service";
import { userStatusManager } from "../../../users/services";

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
    await userSecurityEventHistoryManager.isAccountLockedForOperation({
      operation: "change-password",
      userProfile: "usager",
      userId,
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

  // A successful password change also lifts a TEMPORARILY_BLOCKED soft-lock
  // (BLOCKED stays — clearTemporaryBlock is conditioned on the soft state).
  await userStatusManager.clearTemporaryBlock({
    userProfile: "usager",
    userId,
  });

  await logUserSecurityEvent({
    userProfile: "usager",
    userId,
    userSecurity,
    eventType: "change-password-success",
  });

  // Audit-only on usager profile (no DB session to clear), but kept for
  // parity with the structure / supervisor flows.
  await terminateUserSession({
    userProfile: "usager",
    userId,
    reason: "PASSWORD_CHANGED",
  });
  return updatedUser;
}
