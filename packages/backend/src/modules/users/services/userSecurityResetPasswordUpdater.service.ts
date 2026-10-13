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
import { capturePasswordFlowFailure } from "./passwordFlowSentry.helper";

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
  const user = await getUserRepository(userProfile).findOneBy({ id: userId });
  const userSecurity = await getUserSecurityRepository(
    userProfile
  ).findOneByOrFail({ userId });

  if (
    !user ||
    user.status === "DELETE" ||
    user.status === "BLOCKED" ||
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

  // The token is valid from here on: any failure below is a server error
  // (the controllers turn it into TOKEN_INVALID, which hides it), so report it.
  let step = "invalidate-token";
  try {
    const repository = getUserRepository(userProfile);
    const securityRepository = getUserSecurityRepository(userProfile);

    // Single-use token: invalidate it before issuing the new password so a
    // concurrent retry can't replay it.
    await securityRepository.update({ userId }, { temporaryTokens: null });

    step = "load-user";
    const user = await repository.findOneByOrFail({ id: userId });

    step = "apply-new-password";
    await userPasswordWriter.applyNewPassword({
      user: user as never,
      userProfile,
      newPassword,
      successAction: "RESET_PASSWORD_SUCCESS",
      sessionReason: "PASSWORD_RESET",
      requestContext,
    });
  } catch (error) {
    capturePasswordFlowFailure({
      flow: "reset-password",
      step,
      userProfile,
      userId,
      error,
    });
    throw error;
  }

  return { userId };
}
