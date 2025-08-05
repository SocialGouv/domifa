import { UserProfile, UserSecurity } from "../../../_common/model";
import { passwordGenerator } from "../../../util";
import {
  getUserSecurityRepository,
  getUserRepository,
} from "./get-user-repository.service";
import { logUserSecurityEvent } from "./logUserSecurityEvent.service";
import { userSecurityEventHistoryManager } from "./userSecurityEventHistoryManager.service";

export const userSecurityResetPasswordUpdater = {
  checkResetPasswordToken,
  confirmResetPassword,
};

async function checkResetPasswordToken({
  userId,
  token,
  userProfile,
}: {
  userId: number;
  token: string;
  userProfile: UserProfile;
}): Promise<void> {
  const securityRepository = getUserSecurityRepository(userProfile);

  const userSecurity = await securityRepository.findOneByOrFail({
    userId,
  });

  if (
    userSecurityEventHistoryManager.isAccountLockedForOperation({
      operation: "reset-password-confirm",
      ...userSecurity,
    })
  ) {
    throw new Error("Error");
  }

  if (
    !userSecurity.temporaryTokens?.token ||
    userSecurity.temporaryTokens.token !== token ||
    new Date(userSecurity.temporaryTokens.validity) < new Date()
  ) {
    // update event history
    await logUserSecurityEvent({
      userProfile,
      userId,
      userSecurity,
      eventType: "reset-password-error",
    });
    throw new Error("Error");
  }
}

async function confirmResetPassword({
  userId,
  token,
  newPassword,
  userProfile,
}: {
  userId: number;
  token: string;
  newPassword: string;
  userProfile: UserProfile;
}): Promise<{
  user: any; // Type plus générique pour supporter les deux types d'utilisateurs
  userSecurity: UserSecurity;
}> {
  const repository = getUserRepository(userProfile);
  const securityRepository = getUserSecurityRepository(userProfile);

  let userSecurity = await securityRepository.findOneByOrFail({
    userId,
  });

  if (
    userSecurityEventHistoryManager.isAccountLockedForOperation({
      operation: "reset-password-confirm",
      ...userSecurity,
    })
  ) {
    throw new Error("Error");
  }

  if (
    !userSecurity.temporaryTokens?.token ||
    userSecurity.temporaryTokens.token !== token ||
    new Date(userSecurity.temporaryTokens.validity) < new Date()
  ) {
    // update event history
    await logUserSecurityEvent({
      userProfile,
      userId,
      userSecurity,
      eventType: "reset-password-error",
    });
    throw new Error("Error");
  }

  const hash = await passwordGenerator.generatePasswordHash({
    password: newPassword,
  });

  await repository.update(
    {
      id: userId,
    },
    {
      password: hash,
      passwordLastUpdate: new Date(),
    }
  );

  const user = await repository.findOneBy({
    id: userId,
  });

  await logUserSecurityEvent({
    userProfile,
    userId,
    userSecurity,
    eventType: "reset-password-success",
    clearAllEvents: true, // unlock account if locked
    attributes: {
      temporaryTokens: null,
    },
  });

  userSecurity = await securityRepository.findOne({
    where: {
      userId: user.id,
    },
    order: {
      createdAt: "DESC",
    },
  });

  return {
    user,
    userSecurity,
  };
}
