import { UserProfile } from "../../../_common/model";
import { passwordGenerator } from "../../../util";
import {
  getUserRepository,
  getUserSecurityRepository,
} from "./get-user-repository.service";
import { logUserSecurityEvent } from "./logUserSecurityEvent.service";
import { userSecurityEventHistoryManager } from "./userSecurityEventHistoryManager.service";
import { terminateUserSession } from "./userSessionTerminator.service";
import { otpRepository } from "../../../database";
import { OTP_MAX_ATTEMPTS } from "../../otp/otp.constants";

export const userStructureSecurityPasswordUpdater = {
  updatePassword,
};
async function updatePassword({
  userId,
  oldPassword,
  newPassword,
  userProfile,
}: {
  userId: number;
  oldPassword: string;
  newPassword: string;
  userProfile: UserProfile;
}): Promise<void> {
  const repository = getUserRepository(userProfile);
  const securityRepository = getUserSecurityRepository(userProfile);

  const userSecurity = await securityRepository.findOneByOrFail({
    userId,
  });

  if (
    await userSecurityEventHistoryManager.isAccountLockedForOperation({
      operation: "change-password",
      userProfile,
      userId,
    })
  ) {
    throw new Error("Error");
  }

  const user = await repository.findOneByOrFail({
    id: userId,
  });

  const isValidPass: boolean = await passwordGenerator.checkPassword({
    password: oldPassword,
    hash: user.password,
  });

  if (!isValidPass) {
    await logUserSecurityEvent({
      userProfile,
      userId,
      userSecurity,
      eventType: "change-password-error",
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

  await logUserSecurityEvent({
    userProfile,
    userId,
    userSecurity,
    eventType: "change-password-success",
  });

  // A successful change-password invalidates the active session for the same
  // reason as a reset: the credential changed, the JWT shouldn't survive.
  await terminateUserSession({
    userProfile,
    userId,
    reason: "PASSWORD_CHANGED",
  });

  // The user just typed their old password correctly, so any OTP lockout
  // (3 bad codes → 1h block) accumulated earlier should be lifted.
  if (user.uuid) {
    await otpRepository.resetBlockedOtpsForUser(user.uuid, OTP_MAX_ATTEMPTS);
  }
}
