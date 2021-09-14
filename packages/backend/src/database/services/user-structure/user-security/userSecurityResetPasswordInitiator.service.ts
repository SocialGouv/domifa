import moment = require("moment");
import { domifaConfig } from "../../../../config";
import { tokenGenerator } from "../../../../util";
import {
  UserStructureProfile,
  UserStructureSecurity,
  UserStructureTokens,
  UserStructureTokenType,
} from "../../../../_common/model";
import { userStructureRepository } from "../userStructureRepository.service";
import { userSecurityEventHistoryManager } from "./userSecurityEventHistoryManager.service";
import { userSecurityRepository } from "./userSecurityRepository.service";

export const userSecurityResetPasswordInitiator = {
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
  const user: UserStructureProfile = await userStructureRepository.findOne(
    {
      email: email.toLowerCase(),
    },
    {
      throwErrorIfNotFound: true,
    }
  );

  let userSecurity = await userSecurityRepository.findOne(
    {
      userId: user.id,
    },
    {
      throwErrorIfNotFound: true,
    }
  );

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

  userSecurity = await userSecurityRepository.logEvent({
    userId: user.id,
    userSecurity,
    eventType: "reset-password-request",
    attributes: {
      temporaryTokens,
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
  const validity = moment().add(2, "days").toDate();
  return { type, token, validity };
}
