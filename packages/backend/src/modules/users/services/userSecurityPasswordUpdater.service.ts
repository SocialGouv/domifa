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
import { capturePasswordFlowFailure } from "./passwordFlowSentry.helper";

export const userStructureSecurityPasswordUpdater = {
  updatePassword,
};

type UpdatePasswordArgs = {
  userId: number;
  oldPassword: string;
  newPassword: string;
  userProfile: UserProfile;
  requestContext?: SecurityLogRequestContext;
};

// Business refusals the user is told about (wrong old password, reuse,
// lockout): not worth a Sentry event. Everything else is a server error.
const EXPECTED_STEPS = [
  "old-password-rejected",
  "new-password-same-as-old",
  "new-password-already-used",
];
const EXPECTED_ERROR_MESSAGES = ["BLOCKED_TEMP"];

async function updatePassword(args: UpdatePasswordArgs): Promise<void> {
  const progress = { step: "assert-operation-allowed" };
  try {
    await runUpdatePassword(args, progress);
  } catch (error) {
    const isExpected =
      EXPECTED_STEPS.includes(progress.step) ||
      EXPECTED_ERROR_MESSAGES.includes((error as Error)?.message);
    if (!isExpected) {
      capturePasswordFlowFailure({
        flow: "edit-my-password",
        step: progress.step,
        userProfile: args.userProfile,
        userId: args.userId,
        error,
      });
    }
    throw error;
  }
}

async function runUpdatePassword(
  {
    userId,
    oldPassword,
    newPassword,
    userProfile,
    requestContext,
  }: UpdatePasswordArgs,
  progress: { step: string }
): Promise<void> {
  await userSecurityEventHistoryManager.assertOperationAllowed({
    operation: "change-password",
    userProfile,
    userId,
    requestContext,
  });

  progress.step = "load-user";
  const repository = getUserRepository(userProfile);
  const user = (await repository.findOneByOrFail({ id: userId })) as
    | UserStructure
    | UserSupervisor;

  progress.step = "check-old-password";
  const isValidPass = await passwordGenerator.checkPassword({
    password: oldPassword,
    hash: user.password,
  });

  if (!isValidPass) {
    progress.step = "old-password-rejected";
    await logSecurityEventForUser("CHANGE_PASSWORD_ERROR", userProfile, user, {
      requestContext,
    });
    throw new Error("OLD_PASSWORD_INVALID");
  }

  if (newPassword === oldPassword) {
    progress.step = "new-password-same-as-old";
    await logSecurityEventForUser("CHANGE_PASSWORD_ERROR", userProfile, user, {
      requestContext,
    });
    throw new Error("NEW_PASSWORD_SAME_AS_OLD");
  }

  progress.step = "load-security-row";
  const securityRepository = getUserSecurityRepository(userProfile);
  const userSecurity = await securityRepository.findOneByOrFail({ userId });

  progress.step = "check-password-history";
  for (const previousHash of userSecurity.passwordHistory) {
    const isReusedPassword = await passwordGenerator.checkPassword({
      password: newPassword,
      hash: previousHash,
    });
    if (isReusedPassword) {
      progress.step = "new-password-already-used";
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

  progress.step = "apply-new-password";
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
  progress.step = "update-password-history";
  const updatedHistory = [user.password, ...userSecurity.passwordHistory].slice(
    0,
    PASSWORD_HISTORY_SIZE
  );
  await securityRepository.update(
    { userId },
    { passwordHistory: updatedHistory }
  );
}
