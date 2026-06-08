import { addDays } from "date-fns";

import { CommonUser } from "@domifa/common";
import {
  UserProfile,
  UserSecurity,
  UserTokenType,
  UserTokens,
} from "../../../_common/model";
import { domifaConfig } from "../../../config";
import { tokenGenerator } from "../../../util";
import {
  getUserRepository,
  getUserSecurityRepository,
} from "./get-user-repository.service";
import {
  logSecurityEvent,
  logSecurityEventForUser,
  SecurityLogRequestContext,
} from "../../app-logs/app-log-security-writer";

export const userSecurityResetPasswordInitiator = {
  buildResetPasswordLink,
  generateResetPasswordToken,
  generateResetPasswordTokenAndValidity,
};

function buildResetPasswordLink({
  userId,
  token,
  userProfile,
}: {
  userId: number;
  token: string;
  userProfile: UserProfile;
}) {
  const config = domifaConfig().apps;
  return userProfile === "structure"
    ? `${config.frontendUrl}users/reset-password/${userId}/${token}`
    : `${config.portailAdminUrl}auth/reset-password/${userId}/${token}`;
}

async function generateResetPasswordToken({
  email,
  userProfile,
  requestContext,
}: {
  email: string;
  userProfile: UserProfile;
  requestContext?: SecurityLogRequestContext;
}): Promise<{
  user: Pick<CommonUser, "id" | "nom" | "prenom" | "email">;
  userSecurity: UserSecurity;
  resetLink: string;
}> {
  const securityRepository = getUserSecurityRepository(userProfile);

  const user = await getUserRepository(userProfile).findOneBy({ email });
  if (!user || user.status === "DELETE") {
    // Unknown or soft-deleted account: do not leak the difference. Audit the
    // attempted email so ops can spot password-spray on archived accounts.
    await logSecurityEvent({
      action: "RESET_PASSWORD_REQUEST",
      profile: userProfile,
      attemptedIdentifier: email,
      requestContext,
      context: { userProfile },
    });
    throw new Error("Error");
  }

  // Lockout is intentionally not checked here: a temporarily-blocked user must
  // be able to request a reset to recover their account. The account is only
  // unlocked once the reset is actually completed (see userPasswordWriter).
  const temporaryTokens = generateResetPasswordTokenAndValidity({
    type: "reset-password",
  });

  await securityRepository.update({ userId: user.id }, { temporaryTokens });
  await logSecurityEventForUser("RESET_PASSWORD_REQUEST", userProfile, user, {
    requestContext,
  });

  const userSecurity = await securityRepository.findOneByOrFail({
    userId: user.id,
  });

  return {
    user,
    userSecurity,
    resetLink: buildResetPasswordLink({
      userId: user.id,
      token: temporaryTokens.token,
      userProfile,
    }),
  };
}

function generateResetPasswordTokenAndValidity({
  type,
}: {
  type: UserTokenType;
}): UserTokens {
  const token = tokenGenerator.generateToken({ length: 30 });
  const validity = addDays(new Date(), 2);
  return { type, token, validity };
}
