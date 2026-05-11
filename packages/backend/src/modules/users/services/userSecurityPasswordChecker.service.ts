import { UserStructure, UserSupervisor } from "@domifa/common";

import { passwordGenerator } from "../../../util";
import { userSecurityEventHistoryManager } from "./userSecurityEventHistoryManager.service";
import { UserProfile } from "../../../_common/model";
import {
  getUserRepository,
  getUserSecurityRepository,
} from "./get-user-repository.service";
import { logUserSecurityEvent } from "./logUserSecurityEvent.service";
import { userStatusManager } from "./userStatusManager.service";

export const userSecurityPasswordChecker = {
  checkPassword,
};
async function checkPassword<T extends UserStructure | UserSupervisor>({
  email,
  password,
  userProfile,
}: {
  email: string;
  password: string;
  userProfile: UserProfile;
}): Promise<T> {
  const repository = getUserRepository(userProfile);
  const securityRepository = getUserSecurityRepository(userProfile);

  const user = (await repository.findOneByOrFail({
    email: email.toLowerCase(),
  })) as T;

  const userSecurity = await securityRepository.findOneBy({
    userId: user.id,
  });

  if (!user || !userSecurity) {
    throw new Error("WRONG_CREDENTIALS 1"); // don't give the real cause
  }

  if (
    await userSecurityEventHistoryManager.isAccountLockedForOperation({
      operation: "login",
      userProfile,
      ...userSecurity,
    })
  ) {
    throw new Error("WRONG_CREDENTIALS 2"); // don't give the real cause
  }

  const isValidPass: boolean = await passwordGenerator.checkPassword({
    password,
    hash: user.password,
  });

  if (!isValidPass) {
    await logUserSecurityEvent({
      userProfile,
      userId: user.id,
      userSecurity,
      eventType: "login-error",
    });
    throw new Error("WRONG_CREDENTIALS 3"); // don't give the real cause
  }

  if (user.status === "BLOCKED") {
    throw new Error("ACCOUNT_BLOCKED");
  }

  if (user.status === "PENDING") {
    throw new Error("ACCOUNT_NOT_ACTIVATED");
  }

  // Backoff already passed (throttler check above). If the persisted status
  // is still TEMPORARILY_BLOCKED, clear it now that the user successfully
  // authenticated outside the lockout window.
  if (user.status === "TEMPORARILY_BLOCKED") {
    await userStatusManager.clearTemporaryBlock({
      userProfile,
      userId: user.id,
    });
  }

  await logUserSecurityEvent({
    userProfile,
    userId: user.id,
    userSecurity,
    eventType: "login-success",
  });

  await repository.update({ id: user.id }, { lastLogin: new Date() });

  return repository.findOneBy({
    id: user.id,
  }) as unknown as T;
}
