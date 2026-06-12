import { UserStatus, UserStructure, UserSupervisor } from "@domifa/common";
import { Not } from "typeorm";

import { passwordGenerator } from "../../../util";
import { UserProfile } from "../../../_common/model";
import {
  logSecurityEvent,
  logSecurityEventForUser,
  SecurityLogRequestContext,
} from "../../app-logs/app-log-security-writer";
import { getUserRepository } from "./get-user-repository.service";
import { userSecurityEventHistoryManager } from "./userSecurityEventHistoryManager.service";
import { userStatusManager } from "./userStatusManager.service";

// Wall-clock floor on every login response — neutralises the timing gap
// between "unknown email" (fast DB miss) and "wrong password" (slow bcrypt)
// so an attacker can't distinguish the two from the network. Must exceed a
// single bcrypt compare at cost 10 (~100 ms).
const LOGIN_RESPONSE_TIME_TARGET_MS = 350;

export type CheckPasswordRequestContext = SecurityLogRequestContext & {
  ip: string;
  userAgent: string;
};

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
  const user = await findUserForLogin<T>({
    email,
    userProfile,
    requestContext,
  });

  await userSecurityEventHistoryManager.assertOperationAllowed({
    operation: "login",
    userProfile,
    userId: user.id,
    requestContext,
  });

  const isValidPass = await passwordGenerator.checkPassword({
    password,
    hash: (user as { password: string }).password,
  });
  if (!isValidPass) {
    await logSecurityEventForUser("LOGIN_ERROR", userProfile, user, {
      requestContext,
    });
    throw new Error("WRONG_CREDENTIALS 3"); // don't give the real cause
  }

  await assertStatusActive({ user, userProfile, requestContext });

  // No LOGIN_OK intermediate log: the LOGIN_SUCCESS emitted by the
  // controller after `enforceOrThrow` covers the whole flow.
  const repository = getUserRepository(userProfile);
  await repository.update({ id: user.id }, { lastLogin: new Date() });

  return repository.findOneBy({ id: user.id }) as unknown as T;
}

async function findUserForLogin<T extends UserStructure | UserSupervisor>({
  email,
  userProfile,
  requestContext,
}: {
  email: string;
  userProfile: UserProfile;
  requestContext: CheckPasswordRequestContext;
}): Promise<T> {
  const user = (await getUserRepository(userProfile).findOneBy({
    email: email.trim().toLowerCase(),
    status: Not("DELETE"),
  })) as T | null;

  if (!user) {
    // Unknown email: dedicated LOGIN_UNKNOWN_USER action so enumeration
    // attempts surface distinctly from wrong-password attempts on known
    // accounts. The portal-derived userType is kept (user_structure /
    // user_supervisor) so admin filters can scope these probes per portal;
    // the email tried is stashed in `context.attemptedIdentifier`.
    await logSecurityEvent({
      action: "LOGIN_UNKNOWN_USER",
      profile: userProfile,
      attemptedIdentifier: email,
      requestContext,
      context: { userProfile },
    });
    throw new Error("WRONG_CREDENTIALS 1");
  }

  return user;
}

async function assertStatusActive({
  user,
  userProfile,
  requestContext,
}: {
  user: UserStructure | UserSupervisor;
  userProfile: UserProfile;
  requestContext: CheckPasswordRequestContext;
}): Promise<void> {
  // Re-fetch the status: a prior assertOperationAllowed call may have just
  // cleared TEMPORARILY_BLOCKED if the backoff window expired.
  const currentStatus = await userStatusManager.getUserStatusFromDb({
    userProfile,
    userId: user.id,
  });
  if (currentStatus === "ACTIVE") {
    return;
  }

  await logSecurityEventForUser("ACCESS_DENIED_NON_ACTIVE", userProfile, user, {
    requestContext,
    context: { status: currentStatus, userProfile },
  });

  // Vague error on TEMPORARILY_BLOCKED so the attacker can't distinguish it
  // from a wrong password.
  throw new Error(errorForStatus(currentStatus));
}

function errorForStatus(status: UserStatus | null): string {
  if (status === "BLOCKED") return "ACCOUNT_BLOCKED";
  if (status === "PENDING") return "ACCOUNT_NOT_ACTIVATED";
  return "ACCOUNT_NOT_ACTIVE";
}
