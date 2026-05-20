import { UserStatus, UserStructure, UserSupervisor } from "@domifa/common";

import { passwordGenerator } from "../../../util";
import { userSecurityEventHistoryManager } from "./userSecurityEventHistoryManager.service";
import { UserProfile } from "../../../_common/model";
import {
  getUserRepository,
  getUserSecurityRepository,
} from "./get-user-repository.service";
import { logUserSecurityEvent } from "./logUserSecurityEvent.service";
import { userStatusManager } from "./userStatusManager.service";
import { appLogsRepository, AppLogTable } from "../../../database";
import { SYSTEM_ACTOR_FIELDS } from "../../app-logs/app-logs.helpers";

// Target wall-clock duration for the login flow. We pad every response —
// success or failure — up to this floor to neutralize the timing differential
// between "unknown email" (DB miss, fast) and "wrong password" (bcrypt, slow).
// Must comfortably exceed a single bcrypt compare at cost 10 (~100 ms on
// commodity hardware).
const LOGIN_RESPONSE_TIME_TARGET_MS = 350;

export interface CheckPasswordRequestContext {
  ip: string;
  userAgent: string;
}

export const userSecurityPasswordChecker = {
  checkPassword,
};

async function checkPassword<T extends UserStructure | UserSupervisor>(args: {
  email: string;
  password: string;
  userProfile: UserProfile;
  requestContext: CheckPasswordRequestContext;
}): Promise<T> {
  const started = Date.now();
  try {
    return await checkPasswordImpl<T>(args);
  } finally {
    const elapsed = Date.now() - started;
    if (elapsed < LOGIN_RESPONSE_TIME_TARGET_MS) {
      await new Promise((resolve) =>
        setTimeout(resolve, LOGIN_RESPONSE_TIME_TARGET_MS - elapsed)
      );
    }
  }
}

async function checkPasswordImpl<T extends UserStructure | UserSupervisor>({
  email,
  password,
  userProfile,
  requestContext,
}: {
  email: string;
  password: string;
  userProfile: UserProfile;
  requestContext: CheckPasswordRequestContext;
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

  // Whitelist: only ACTIVE accounts can authenticate. Re-fetch the status
  // because isAccountLockedForOperation may have cleared TEMPORARILY_BLOCKED
  // when the backoff window expired.
  const currentStatus = await userStatusManager.getUserStatusFromDb({
    userProfile,
    userId: user.id,
  });

  if (currentStatus !== "ACTIVE") {
    await logAccessDeniedOnLogin({
      userProfile,
      userId: user.id,
      status: currentStatus,
      requestContext,
    });
    if (currentStatus === "BLOCKED") {
      throw new Error("ACCOUNT_BLOCKED");
    }
    if (currentStatus === "PENDING") {
      throw new Error("ACCOUNT_NOT_ACTIVATED");
    }
    // TEMPORARILY_BLOCKED and any other non-ACTIVE state fall through to a
    // vague error so we don't leak account state to attackers.
    throw new Error("ACCOUNT_NOT_ACTIVE");
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

async function logAccessDeniedOnLogin({
  userProfile,
  userId,
  status,
  requestContext,
}: {
  userProfile: UserProfile;
  userId: number;
  status: UserStatus | null;
  requestContext: CheckPasswordRequestContext;
}): Promise<void> {
  await appLogsRepository
    .save(
      new AppLogTable({
        ...SYSTEM_ACTOR_FIELDS,
        action: "ACCESS_DENIED_NON_ACTIVE",
        context: {
          triggeredBy: "userSecurityPasswordChecker",
          status,
          userProfile,
          userId,
          ip: requestContext.ip,
          userAgent: requestContext.userAgent,
        },
      })
    )
    .catch(() => undefined);
}
