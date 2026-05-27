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
import { userSecurityEventHistoryManager } from "./userSecurityEventHistoryManager.service";
import {
  logSecurityEvent,
  logSecurityEventForUser,
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
}: {
  email: string;
  userProfile: UserProfile;
}): Promise<{
  user: Pick<CommonUser, "id" | "nom" | "prenom" | "email">;
  userSecurity: UserSecurity;
  resetLink: string;
}> {
  const securityRepository = getUserSecurityRepository(userProfile);

  const user = await getUserRepository(userProfile).findOneBy({ email });
  if (!user) {
    await logSecurityEvent({
      action: "RESET_PASSWORD_REQUEST",
      userType: "anonymous",
      identifier: email,
      context: { userProfile },
    });
    throw new Error("Error");
  }

  await userSecurityEventHistoryManager.assertOperationAllowed({
    operation: "reset-password-request",
    userProfile,
    userId: user.id,
  });

  const temporaryTokens = generateResetPasswordTokenAndValidity({
    type: "reset-password",
  });

  await securityRepository.update({ userId: user.id }, { temporaryTokens });
  await logSecurityEventForUser("RESET_PASSWORD_REQUEST", userProfile, user);

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
