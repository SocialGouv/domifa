import {
  getPasswordChangeStatus,
  PASSWORD_HISTORY_SIZE,
  UserStructure,
  UserSupervisor,
} from "@domifa/common";

import { UserProfile } from "../../../_common/model";
import { passwordGenerator } from "../../../util";
import {
  logSecurityEventForUser,
  SecurityLogRequestContext,
} from "../../app-logs/app-log-security-writer";
import {
  getUserRepository,
  getUserSecurityRepository,
} from "./get-user-repository.service";
import { userSecurityEventHistoryManager } from "./userSecurityEventHistoryManager.service";
import { userPasswordWriter } from "./userPasswordWriter.service";

export const userStructureSecurityPasswordUpdater = {
  updatePassword,
};

async function updatePassword({
  userId,
  oldPassword,
  newPassword,
  userProfile,
  requestContext,
}: {
  userId: number;
  oldPassword: string;
  newPassword: string;
  userProfile: UserProfile;
  requestContext?: SecurityLogRequestContext;
}): Promise<void> {
  await userSecurityEventHistoryManager.assertOperationAllowed({
    operation: "change-password",
    userProfile,
    userId,
    requestContext,
  });

  const repository = getUserRepository(userProfile);
  const user = (await repository.findOneByOrFail({ id: userId })) as
    | UserStructure
    | UserSupervisor;

  const isValidPass = await passwordGenerator.checkPassword({
    password: oldPassword,
    hash: user.password,
  });

  if (!isValidPass) {
    await logSecurityEventForUser("CHANGE_PASSWORD_ERROR", userProfile, user, {
      requestContext,
    });
    throw new Error("Error");
  }

  if (newPassword === oldPassword) {
    await logSecurityEventForUser("CHANGE_PASSWORD_ERROR", userProfile, user, {
      requestContext,
    });
    throw new Error("NEW_PASSWORD_SAME_AS_OLD");
  }

  const securityRepository = getUserSecurityRepository(userProfile);
  const userSecurity = await securityRepository.findOneByOrFail({ userId });

  for (const previousHash of userSecurity.passwordHistory) {
    const isReusedPassword = await passwordGenerator.checkPassword({
      password: newPassword,
      hash: previousHash,
    });
    if (isReusedPassword) {
      await logSecurityEventForUser(
        "CHANGE_PASSWORD_ERROR",
        userProfile,
        user,
        { requestContext }
      );
      throw new Error("NEW_PASSWORD_ALREADY_USED");
    }
  }

  // Same endpoint/flow is used for a voluntary change and for renewing a
  // password that's overdue (the frontend just redirects here when the
  // account is EXPIRED, instead of blocking anything at login) — log it
  // distinctly so support can tell the two apart.
  const isOverdueRenewal =
    getPasswordChangeStatus(user.passwordLastUpdate, user.createdAt) ===
    "EXPIRED";

  await userPasswordWriter.applyNewPassword({
    user,
    userProfile,
    newPassword,
    successAction: isOverdueRenewal
      ? "RESET_OUTDATED_PASSWORD_SUCCESS"
      : "CHANGE_PASSWORD_SUCCESS",
    failAction: isOverdueRenewal ? "RESET_OUTDATED_PASSWORD_FAIL" : undefined,
    sessionReason: "PASSWORD_CHANGED",
    requestContext,
    logContext: isOverdueRenewal
      ? { previousPasswordLastUpdate: user.passwordLastUpdate }
      : undefined,
  });

  // Keep the replaced hash so it can't be set again later.
  const updatedHistory = [user.password, ...userSecurity.passwordHistory].slice(
    0,
    PASSWORD_HISTORY_SIZE
  );
  await securityRepository.update(
    { userId },
    { passwordHistory: updatedHistory }
  );
}
