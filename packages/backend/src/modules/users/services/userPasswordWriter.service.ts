import { SecurityLogAction } from "@domifa/common";

import { otpRepository } from "../../../database";
import { passwordGenerator } from "../../../util";
import { UserProfile } from "../../../_common/model";
import {
  logSecurityEventForUser,
  SecurityLogRequestContext,
  SessionTerminationReason,
} from "../../app-logs/app-log-security-writer";
import { OTP_MAX_ATTEMPTS } from "../../otp/otp.constants";
import { getUserRepository } from "./get-user-repository.service";
import { terminateUserSession } from "./userSessionTerminator.service";
import { userStatusManager } from "./userStatusManager.service";

type PasswordSubject = {
  id: number;
  uuid?: string;
  prenom?: string | null;
  nom?: string | null;
  login?: string | null;
  structureId?: number;
  role?: string;
};

// One place for the "I just changed someone's password" follow-up: persist
// the new hash, activate PENDING accounts, clear soft-lock + OTP lockout, log
// the success and terminate the active session. Called by both the change-
// password and the reset-password flows so they stay in sync.
export const userPasswordWriter = {
  applyNewPassword,
};

async function applyNewPassword({
  user,
  userProfile,
  newPassword,
  successAction,
  sessionReason,
  requestContext,
}: {
  user: PasswordSubject;
  userProfile: UserProfile;
  newPassword: string;
  successAction: SecurityLogAction;
  sessionReason: SessionTerminationReason;
  requestContext?: SecurityLogRequestContext;
}): Promise<void> {
  const repository = getUserRepository(userProfile);

  const hash = await passwordGenerator.generatePasswordHash({
    password: newPassword,
  });
  await repository.update(
    { id: user.id },
    { password: hash, passwordLastUpdate: new Date() }
  );

  // BLOCKED accounts stay BLOCKED; the helpers below are no-op when the
  // status condition doesn't match.
  await userStatusManager.activateFromPending({ userProfile, userId: user.id });
  await userStatusManager.clearTemporaryBlock({ userProfile, userId: user.id });

  await logSecurityEventForUser(successAction, userProfile, user, {
    requestContext,
  });

  await terminateUserSession({
    userProfile,
    userId: user.id,
    reason: sessionReason,
    structureId: user.structureId,
    role: user.role,
    requestContext,
  });

  // The user just proved identity (old password / valid reset token), so any
  // OTP lockout accumulated earlier should be lifted.
  if (user.uuid) {
    await otpRepository.resetBlockedOtpsForUser(user.uuid, OTP_MAX_ATTEMPTS);
  }
}
