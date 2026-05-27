import { UserProfile, UserSecurity } from "../../../_common/model";
import { passwordGenerator } from "../../../util";
import {
  getUserSecurityRepository,
  getUserRepository,
} from "./get-user-repository.service";
import { logUserSecurityEvent } from "./logUserSecurityEvent.service";
import { userSecurityEventHistoryManager } from "./userSecurityEventHistoryManager.service";
import { userStatusManager } from "./userStatusManager.service";
import { terminateUserSession } from "./userSessionTerminator.service";
import { otpRepository } from "../../../database";
import { OTP_MAX_ATTEMPTS } from "../../otp/otp.constants";

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
    await userSecurityEventHistoryManager.isAccountLockedForOperation({
      operation: "reset-password-confirm",
      userProfile,
      userId,
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
    await userSecurityEventHistoryManager.isAccountLockedForOperation({
      operation: "reset-password-confirm",
      userProfile,
      userId,
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

  // Activate the account if it was in PENDING state (initial password set after creation).
  // BLOCKED accounts stay BLOCKED — only an admin unblock can lift it.
  await repository.update(
    { id: userId, status: "PENDING" },
    { status: "ACTIVE" }
  );

  // A successful reset also clears a TEMPORARILY_BLOCKED soft-lock (the
  // backoff that fires after too many failed attempts). BLOCKED stays
  // BLOCKED — clearTemporaryBlock is conditioned on TEMPORARILY_BLOCKED.
  await userStatusManager.clearTemporaryBlock({ userProfile, userId });

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

  // Invalidate any active session: a fresh credential must not coexist with
  // a JWT signed against the previous session's fingerprint.
  await terminateUserSession({
    userProfile,
    userId,
    reason: "PASSWORD_RESET",
  });

  // A reset link is itself a proof of identity, so lift any OTP lockout this
  // user may have accumulated (3 bad codes → 1h block). Rows are kept for
  // audit; only `attempts` is reset to 0 so findRecentBlocked stops matching.
  if (user?.uuid) {
    await otpRepository.resetBlockedOtpsForUser(user.uuid, OTP_MAX_ATTEMPTS);
  }

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
