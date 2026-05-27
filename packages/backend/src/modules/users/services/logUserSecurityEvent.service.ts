import { SecurityLogAction } from "@domifa/common";

import {
  UserProfile,
  UserSecurity,
  UserSecurityEventType,
} from "../../../_common/model";
import {
  logSecurityEvent,
  SecurityLogRequestContext,
} from "../../app-logs/app-log-security-writer";
import { getUserSecurityRepository } from "./get-user-repository.service";

// `login-success` is profile-aware: for structure/supervisor it only means
// "password verified — OTP step pending" (= LOGIN_OK); LOGIN_SUCCESS is
// emitted later, after OTP validation. Usagers have no OTP so the password
// check is the session opening.
const EVENT_TYPE_TO_ACTION: Record<
  UserSecurityEventType,
  SecurityLogAction | null
> = {
  "login-error": "LOGIN_ERROR",
  "login-success": "LOGIN_OK",
  "change-password-error": "CHANGE_PASSWORD_ERROR",
  "change-password-success": "CHANGE_PASSWORD_SUCCESS",
  "reset-password-request": "RESET_PASSWORD_REQUEST",
  "reset-password-success": "RESET_PASSWORD_SUCCESS",
  "reset-password-error": "RESET_PASSWORD_ERROR",
  "validate-account-success": "VALIDATE_ACCOUNT_SUCCESS",
  "validate-account-error": "VALIDATE_ACCOUNT_ERROR",
  "account-unblocked": "UNBLOCK_USER",
};

export const logUserSecurityEvent = async ({
  userProfile,
  userId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userSecurity: _userSecurity,
  eventType,
  attributes,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  clearAllEvents: _clearAllEvents,
  requestContext,
  structureId,
  role,
}: {
  userProfile: UserProfile;
  userId: number;
  userSecurity?: UserSecurity;
  eventType: UserSecurityEventType;
  attributes?: Partial<UserSecurity>;
  clearAllEvents?: boolean;
  requestContext?: SecurityLogRequestContext;
  structureId?: number;
  role?: string;
}) => {
  // Non-log attributes (e.g. clearing temporaryTokens after a successful
  // password reset) still need to be persisted on user_*_security.
  if (attributes && Object.keys(attributes).length > 0) {
    const securityRepository = getUserSecurityRepository(userProfile);
    await securityRepository.update({ userId }, attributes);
  }

  const action = resolveAction(eventType, userProfile);
  if (action) {
    await logSecurityEvent({
      action,
      profile: userProfile,
      userId,
      structureId,
      role: role as never,
      requestContext,
    });
  }
};

function resolveAction(
  eventType: UserSecurityEventType,
  userProfile: UserProfile
): SecurityLogAction | null {
  if (eventType === "login-success" && userProfile === "usager") {
    return "LOGIN_SUCCESS";
  }
  return EVENT_TYPE_TO_ACTION[eventType];
}
