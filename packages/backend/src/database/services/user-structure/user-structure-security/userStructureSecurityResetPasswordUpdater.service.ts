import { passwordGenerator } from "../../../../util/encoding/passwordGenerator.service";
import {
  UserStructureProfile,
  UserStructureSecurity,
} from "../../../../_common/model";
import { userStructureRepository } from "../userStructureRepository.service";
import { userStructureSecurityEventHistoryManager } from "./userStructureSecurityEventHistoryManager.service";
import { userStructureSecurityRepository } from "./userStructureSecurityRepository.service";

export const userStructureSecurityResetPasswordUpdater = {
  checkResetPasswordToken,
  confirmResetPassword,
};

async function confirmResetPassword({
  userId,
  token,
  newPassword,
}: {
  userId: number;
  token: string;
  newPassword: string;
}): Promise<{
  user: UserStructureProfile;
  userSecurity: UserStructureSecurity;
}> {
  let userSecurity = await userStructureSecurityRepository.findOne(
    {
      userId,
    },
    {
      throwErrorIfNotFound: true,
    }
  );
  if (
    userStructureSecurityEventHistoryManager.isAccountLockedForOperation({
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
    await userStructureSecurityRepository.logEvent({
      userId,
      userSecurity,
      eventType: "reset-password-error",
    });
    throw new Error("Error");
  }
  const hash = await passwordGenerator.generatePasswordHash({
    password: newPassword,
  });
  const user: UserStructureProfile = await userStructureRepository.updateOne(
    {
      id: userId,
    },
    {
      password: hash,
      passwordLastUpdate: new Date(),
    }
  );

  userSecurity = await userStructureSecurityRepository.logEvent({
    userId,
    userSecurity,
    eventType: "reset-password-success",
    clearAllEvents: true, // unlock account if locked
    attributes: {
      temporaryTokens: null,
    },
  });

  return {
    user,
    userSecurity,
  };
}

async function checkResetPasswordToken({
  userId,
  token,
}: {
  userId: number;
  token: string;
}): Promise<void> {
  const userSecurity = await userStructureSecurityRepository.findOne(
    {
      userId,
    },
    {
      throwErrorIfNotFound: true,
    }
  );
  if (
    userStructureSecurityEventHistoryManager.isAccountLockedForOperation({
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
    await userStructureSecurityRepository.logEvent({
      userId,
      userSecurity,
      eventType: "reset-password-error",
    });
    throw new Error("Error");
  }

  return;
}
