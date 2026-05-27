import { addHours, differenceInMinutes } from "date-fns";
import { FAILED_AUTH_ACTIONS } from "@domifa/common";

import { domifaConfig } from "../../../config";
import { appLogger } from "../../../util";
import { UserProfile, UserSecurityLogError } from "../../../_common/model";
import { summarizeSecurityEventsForUser } from "../../app-logs/app-log-security-counters";
import { logSecurityEvent } from "../../app-logs/app-log-security-writer";
import { userStatusManager } from "./userStatusManager.service";

// After this many failed auth events within `LOCKOUT_WINDOW_HOURS`, the
// account is soft-locked for `LOCKOUT_DURATION_HOURS`. A successful
// RESET_PASSWORD_SUCCESS resets the counter (see app-log-security-counters).
export const FAILED_AUTH_ATTEMPTS_BEFORE_LOCK = 3;
export const LOCKOUT_WINDOW_HOURS = 1;
export const LOCKOUT_DURATION_HOURS = 1;

export const userSecurityEventHistoryManager = {
  isAccountLockedForOperation,
  getBackoffTime,
  assertOperationAllowed,
};

// Wrap the lockout check + throw with the unified `BLOCKED_TEMP` code so
// every flow (login, change pwd, reset, OTP) surfaces the same error shape.
async function assertOperationAllowed(args: {
  operation: string;
  userId: number;
  userProfile: UserProfile;
}): Promise<void> {
  if (await isAccountLockedForOperation(args)) {
    throw new Error("BLOCKED_TEMP");
  }
}

// Counts the failed-auth events on `app_log_security` over the lockout window
// and returns the remaining minutes before the account is freed, or null when
// no backoff is active.
export async function getBackoffTime({
  userProfile,
  userId,
}: {
  userProfile: UserProfile;
  userId: number;
}): Promise<number | null> {
  const { count, lastEventDate } = await summarizeSecurityEventsForUser({
    profile: userProfile,
    userId,
    actions: FAILED_AUTH_ACTIONS,
    sinceMinutes: LOCKOUT_WINDOW_HOURS * 60,
    resetByActions: ["RESET_PASSWORD_SUCCESS"],
  });

  if (count < FAILED_AUTH_ATTEMPTS_BEFORE_LOCK || !lastEventDate) {
    return null;
  }

  const endBlockingDate = addHours(lastEventDate, LOCKOUT_DURATION_HOURS);
  if (endBlockingDate < new Date()) {
    return null;
  }
  return differenceInMinutes(endBlockingDate, new Date());
}

async function isAccountLockedForOperation({
  operation,
  userId,
  userProfile,
}: {
  operation: string;
  userId: number;
  userProfile: UserProfile;
}): Promise<boolean> {
  const backoffTime = await getBackoffTime({ userProfile, userId });
  if (backoffTime !== null) {
    logOperationError({ operation, userId, userProfile });
    await markAccountTemporarilyBlocked({
      userProfile,
      userId,
      reason: "FAILED_AUTH_THRESHOLD",
      operation,
      backoffMinutes: backoffTime,
    });
    return true;
  }
  // Window expired — auto-clear any lingering TEMPORARILY_BLOCKED so the
  // strict "only ACTIVE" check downstream sees the real state.
  await userStatusManager
    .clearTemporaryBlock({ userProfile, userId })
    .catch(() => undefined);
  return false;
}

// Marks the account as TEMPORARILY_BLOCKED and persists a BLOCK_USER row in
// app_log_security so the lockout is auditable on the user's "Suivi sécurité"
// tab. Exported because the OTP service hits the same path when its rate-
// limit (OTP_MAX_REQUESTS_PER_HOUR) is reached.
export async function markAccountTemporarilyBlocked({
  userProfile,
  userId,
  reason,
  operation,
  structureId,
  backoffMinutes,
}: {
  userProfile: UserProfile;
  userId: number;
  reason: "FAILED_AUTH_THRESHOLD" | "OTP_REQUEST_LIMIT";
  operation?: string;
  structureId?: number;
  backoffMinutes?: number | null;
}): Promise<void> {
  await userStatusManager.markUserAsTemporarilyBlocked({
    userProfile,
    userId,
  });
  await logSecurityEvent({
    action: "BLOCK_USER",
    profile: userProfile,
    userId,
    structureId,
    context: {
      reason,
      operation,
      backoffMinutes: backoffMinutes ?? null,
    },
  });
}

function logOperationError(context: UserSecurityLogError) {
  if (domifaConfig().envId === "dev" || domifaConfig().envId === "local") {
    appLogger.warn(
      "Operation forbidden due to excessive recent security events",
      { context }
    );
  } else if (domifaConfig().envId !== "test") {
    appLogger.error(
      "Operation forbidden due to excessive recent security events",
      {
        sentry: true,
        context,
      }
    );
  }
}
