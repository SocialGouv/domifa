import { UserProfile, UserSecurity } from "../../../_common/model";
import {
  getUserRepository,
  getUserSecurityRepository,
} from "./get-user-repository.service";
import {
  logSecurityEventForUser,
  SecurityLogRequestContext,
} from "../../app-logs/app-log-security-writer";
import { userPasswordWriter } from "./userPasswordWriter.service";

export const userSecurityResetPasswordUpdater = {
  checkResetPasswordToken,
  confirmResetPassword,
};

async function checkResetPasswordToken({
  userId,
  token,
  userProfile,
  requestContext,
}: {
  userId: number;
  token: string;
  userProfile: UserProfile;
  requestContext?: SecurityLogRequestContext;
}): Promise<UserSecurity> {
  // Lockout is intentionally not checked here: a temporarily-blocked user must
  // be able to follow the reset link from their email. The account is only
  // unlocked once the reset is actually completed (see userPasswordWriter).
  const userSecurity = await getUserSecurityRepository(
    userProfile
  ).findOneByOrFail({ userId });

  if (
    !userSecurity.temporaryTokens?.token ||
    userSecurity.temporaryTokens.token !== token ||
    new Date(userSecurity.temporaryTokens.validity) < new Date()
  ) {
    await logSecurityEventForUser(
      "RESET_PASSWORD_ERROR",
      userProfile,
      { id: userId },
      { requestContext }
    );
    throw new Error("Error");
  }

  return userSecurity;
}

async function confirmResetPassword({
  userId,
  token,
  newPassword,
  userProfile,
  requestContext,
}: {
  userId: number;
  token: string;
  newPassword: string;
  userProfile: UserProfile;
  requestContext?: SecurityLogRequestContext;
}): Promise<{ userId: number }> {
  await checkResetPasswordToken({ userId, token, userProfile, requestContext });

  const repository = getUserRepository(userProfile);
  const securityRepository = getUserSecurityRepository(userProfile);

  // Single-use token: invalidate it before issuing the new password so a
  // concurrent retry can't replay it.
  await securityRepository.update({ userId }, { temporaryTokens: null });

  const user = await repository.findOneByOrFail({ id: userId });

  await userPasswordWriter.applyNewPassword({
    user: user as never,
    userProfile,
    newPassword,
    successAction: "RESET_PASSWORD_SUCCESS",
    sessionReason: "PASSWORD_RESET",
    requestContext,
  });

  return { userId };
}
