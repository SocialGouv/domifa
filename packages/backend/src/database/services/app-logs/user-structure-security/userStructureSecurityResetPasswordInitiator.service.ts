import { addDays } from "date-fns";

import { domifaConfig } from "../../../../config";
import { tokenGenerator } from "../../../../util";
import {
  UserStructureProfile,
  UserStructureSecurity,
  UserStructureTokens,
  UserStructureTokenType,
} from "../../../../_common/model";
import { userStructureRepository } from "../../user-structure";
import { userStructureSecurityEventHistoryManager } from "./userStructureSecurityEventHistoryManager.service";
import { userStructureSecurityRepository } from "./userStructureSecurityRepository.service";

export const userStructureSecurityResetPasswordInitiator = {
  buildResetPasswordLink,
  generateResetPasswordToken,
  generateResetPasswordTokenAndValidity,
};

function buildResetPasswordLink({
  userId,
  token,
}: {
  userId: number;
  token: string;
}) {
  const frontendUrl = domifaConfig().apps.frontendUrl;
  return `${frontendUrl}reset-password/${userId}/${token}`;
}

async function generateResetPasswordToken({
  email,
}: {
  email: string;
}): Promise<{
  user: UserStructureProfile;
  userSecurity: UserStructureSecurity;
}> {
  const user: UserStructureProfile =
    await userStructureRepository.findOneByOrFail({
      email: email.toLowerCase(),
    });

  let userSecurity = await userStructureSecurityRepository.findOneByOrFail({
    userId: user.id,
  });

  if (
    userStructureSecurityEventHistoryManager.isAccountLockedForOperation({
      operation: "reset-password-request",
      ...userSecurity,
    })
  ) {
    throw new Error("Error");
  }

  const temporaryTokens = generateResetPasswordTokenAndValidity({
    type: "reset-password",
  });

  await userStructureSecurityRepository.logEvent({
    userId: user.id,
    userSecurity,
    eventType: "reset-password-request",
    attributes: {
      temporaryTokens,
    },
  });

  userSecurity = await userStructureSecurityRepository.findOne({
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

function generateResetPasswordTokenAndValidity({
  type,
}: {
  type: UserStructureTokenType;
}): UserStructureTokens {
  const token = tokenGenerator.generateToken({ length: 30 });
  const validity = addDays(new Date(), 2);
  return { type, token, validity };
}
