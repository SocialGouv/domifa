import { UserUsager } from "@domifa/common";
import { userUsagerRepository } from "../../../../database";
import { passwordGenerator } from "../../../../util";
import { userSecurityEventHistoryManager } from "../../../users/services";
import { userPasswordWriter } from "../../../users/services/userPasswordWriter.service";
import {
  logSecurityEventForUser,
  SecurityLogRequestContext,
} from "../../../app-logs/app-log-security-writer";

export const userUsagerSecurityPasswordUpdater = {
  updatePassword,
};

async function updatePassword({
  userId,
  oldPassword,
  newPassword,
  requestContext,
}: {
  userId: number;
  oldPassword: string;
  newPassword: string;
  requestContext?: SecurityLogRequestContext;
}): Promise<UserUsager> {
  await userSecurityEventHistoryManager.assertOperationAllowed({
    operation: "change-password",
    userProfile: "usager",
    userId,
    requestContext,
  });

  const user = await userUsagerRepository.findOneByOrFail({ id: userId });
  const isValidPass = await passwordGenerator.checkPassword({
    password: oldPassword,
    hash: user.password,
  });
  if (!isValidPass) {
    await logSecurityEventForUser("CHANGE_PASSWORD_ERROR", "usager", user, {
      requestContext,
    });
    throw new Error("Error");
  }

  await userPasswordWriter.applyNewPassword({
    user,
    userProfile: "usager",
    newPassword,
    successAction: "CHANGE_PASSWORD_SUCCESS",
    sessionReason: "PASSWORD_CHANGED",
    requestContext,
  });

  // `acceptTerms` is a usager-specific concern: every personal password set
  // (re)stamps the consent date. Other profiles don't have this column.
  await userUsagerRepository.update(
    { id: userId },
    { acceptTerms: new Date() }
  );

  return userUsagerRepository.findOneByOrFail({ id: userId });
}
