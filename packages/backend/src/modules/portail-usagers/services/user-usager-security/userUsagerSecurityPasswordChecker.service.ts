import { UserUsager } from "@domifa/common";
import {
  userUsagerRepository,
  userUsagerSecurityRepository,
} from "../../../../database";
import { passwordGenerator } from "../../../../util";
import { userUsagerSecurityPasswordUpdater } from "./userUsagerSecurityPasswordUpdater.service";
import {
  logUserSecurityEvent,
  userSecurityEventHistoryManager,
  userStatusManager,
} from "../../../users/services";
import {
  logSecurityEvent,
  SecurityLogRequestContext,
} from "../../../app-logs/app-log-security-writer";

export const userUsagerSecurityPasswordChecker = {
  checkPassword,
};

async function checkPassword({
  login,
  password,
  newPassword,
  requestContext,
}: {
  login: string;
  password: string;
  newPassword: string;
  requestContext?: SecurityLogRequestContext;
}): Promise<UserUsager> {
  const user = await userUsagerRepository.findOne({
    where: {
      login: login.toUpperCase(),
    },
    select: {
      password: true,
      salt: true,
      id: true,
      status: true,
      structureId: true,
    },
  });

  if (!user) {
    await logSecurityEvent({
      action: "LOGIN_ERROR",
      userType: "anonymous",
      identifier: login,
      requestContext,
      context: { userProfile: "usager" },
    });
    throw new Error("WRONG_CREDENTIALS 8"); // don't give the real cause
  }

  const userSecurity = await userUsagerSecurityRepository.findOneOrFail({
    where: { userId: user.id },
  });

  if (
    await userSecurityEventHistoryManager.isAccountLockedForOperation({
      operation: "login",
      userProfile: "usager",
      userId: user.id,
    })
  ) {
    throw new Error("BLOCKED_TEMP");
  }

  const isValidPass: boolean = await passwordGenerator.checkPassword({
    password,
    hash: user.password,
  });

  if (!isValidPass) {
    await logUserSecurityEvent({
      userProfile: "usager",
      userId: user.id,
      userSecurity,
      eventType: "login-error",
      requestContext,
      structureId: user.structureId,
    });
    throw new Error("WRONG_CREDENTIALS 9"); // don't give the real cause
  }

  if (user.status === "BLOCKED") {
    throw new Error("ACCOUNT_BLOCKED");
  }

  if (user.status === "TEMPORARILY_BLOCKED") {
    await userStatusManager.clearTemporaryBlock({
      userProfile: "usager",
      userId: user.id,
    });
  }

  await logUserSecurityEvent({
    userProfile: "usager",
    userId: user.id,
    userSecurity,
    eventType: "login-success",
    requestContext,
    structureId: user.structureId,
  });
  if (newPassword) {
    // update password
    await userUsagerSecurityPasswordUpdater.updatePassword({
      userId: user.id,
      oldPassword: password,
      newPassword,
    });
    await userUsagerRepository.update(
      {
        id: user.id,
      },
      {
        lastLogin: new Date(),
        passwordType: "PERSONAL",
        passwordLastUpdate: new Date(),
      }
    );
    // Activate the account on first password personalization.
    // BLOCKED accounts already threw above; this filter keeps us defensive.
    await userUsagerRepository.update(
      { id: user.id, status: "PENDING" },
      { status: "ACTIVE" }
    );
  } else {
    await userUsagerRepository.update(
      {
        id: user.id,
      },
      {
        lastLogin: new Date(),
      }
    );
  }

  return userUsagerRepository.findOneBy({
    id: user.id,
  });
}
