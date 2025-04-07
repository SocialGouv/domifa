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
  // Utiliser l'URL frontend pour les utilisateurs de structure, et adminFrontUrl pour les superviseurs
  const baseUrl =
    userProfile === "structure" ? config.frontendUrl : config.portailAdminUrl;
  return `${baseUrl}users/reset-password/${userId}/${token}`;
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
  const repository = getUserRepository(userProfile);
  const securityRepository = getUserSecurityRepository(userProfile);

  const user: Pick<CommonUser, "id" | "nom" | "prenom" | "email"> =
    await repository.findOneByOrFail({
      email,
    });

  let userSecurity = await securityRepository.findOneByOrFail({
    userId: user.id,
  });

  if (
    userSecurityEventHistoryManager.isAccountLockedForOperation({
      operation: "reset-password-request",
      ...userSecurity,
    })
  ) {
    throw new Error("Error");
  }

  const temporaryTokens = generateResetPasswordTokenAndValidity({
    type: "reset-password",
  });

  await securityRepository.logEvent({
    userId: user.id,
    userSecurity,
    eventType: "reset-password-request",
    attributes: {
      temporaryTokens,
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

  // Générer le lien de réinitialisation avec le bon type d'utilisateur
  const resetLink = buildResetPasswordLink({
    userId: user.id,
    token: temporaryTokens.token,
    userProfile,
  });

  return {
    user,
    userSecurity,
    resetLink, // Retourner le lien directement pour faciliter son utilisation
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
