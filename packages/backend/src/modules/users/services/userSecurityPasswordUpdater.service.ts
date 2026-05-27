import { UserStructure, UserSupervisor } from "@domifa/common";

import { UserProfile } from "../../../_common/model";
import { passwordGenerator } from "../../../util";
import { logSecurityEventForUser } from "../../app-logs/app-log-security-writer";
import { getUserRepository } from "./get-user-repository.service";
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
}: {
  userId: number;
  oldPassword: string;
  newPassword: string;
  userProfile: UserProfile;
}): Promise<void> {
  await userSecurityEventHistoryManager.assertOperationAllowed({
    operation: "change-password",
    userProfile,
    userId,
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
    await logSecurityEventForUser("CHANGE_PASSWORD_ERROR", userProfile, user);
    throw new Error("Error");
  }

  await userPasswordWriter.applyNewPassword({
    user,
    userProfile,
    newPassword,
    successAction: "CHANGE_PASSWORD_SUCCESS",
    sessionReason: "PASSWORD_CHANGED",
  });
}
