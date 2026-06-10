import { UserUsager } from "@domifa/common";
import { userUsagerRepository } from "../../../../database";
import { passwordGenerator } from "../../../../util";
import { userUsagerSecurityPasswordUpdater } from "./userUsagerSecurityPasswordUpdater.service";
import {
  userSecurityEventHistoryManager,
  userStatusManager,
} from "../../../users/services";
import {
  logSecurityEvent,
  logSecurityEventForUser,
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
    where: { login: login.trim().toUpperCase() },
    select: {
      password: true,
      salt: true,
      id: true,
      status: true,
      structureId: true,
      login: true,
    },
  });

  if (!user) {
    // Unknown login: dedicated LOGIN_UNKNOWN_USER action so enumeration
    // attempts surface distinctly from wrong-password attempts on known
    // accounts. Keep the `usager` userType so admin filters can scope the
    // probe to the bénéficiaire portal; the login tried lands in
    // context.attemptedIdentifier.
    await logSecurityEvent({
      action: "LOGIN_UNKNOWN_USER",
      profile: "usager",
      attemptedIdentifier: login,
      requestContext,
      context: { userProfile: "usager" },
    });
    throw new Error("WRONG_CREDENTIALS 8");
  }

  await userSecurityEventHistoryManager.assertOperationAllowed({
    operation: "login",
    userProfile: "usager",
    userId: user.id,
    requestContext,
  });

  const isValidPass = await passwordGenerator.checkPassword({
    password,
    hash: user.password,
  });
  if (!isValidPass) {
    await logSecurityEventForUser("LOGIN_ERROR", "usager", user, {
      requestContext,
    });
    throw new Error("WRONG_CREDENTIALS 9");
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

  await logSecurityEventForUser("LOGIN_SUCCESS", "usager", user, {
    requestContext,
  });

  if (newPassword) {
    await userUsagerSecurityPasswordUpdater.updatePassword({
      userId: user.id,
      oldPassword: password,
      newPassword,
      requestContext,
    });
    // First personal password set: stamp `passwordType` + activate the
    // account if it was still PENDING. The password write itself + session
    // termination are handled by the updater.
    await userUsagerRepository.update(
      { id: user.id },
      {
        lastLogin: new Date(),
        passwordType: "PERSONAL",
        passwordLastUpdate: new Date(),
      }
    );
    await userStatusManager.activateFromPending({
      userProfile: "usager",
      userId: user.id,
    });
  } else {
    await userUsagerRepository.update(
      { id: user.id },
      { lastLogin: new Date() }
    );
  }

  return userUsagerRepository.findOneBy({ id: user.id });
}
