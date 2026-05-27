import { UserProfile } from "../../../_common/model";
import {
  logSecurityEvent,
  SecurityLogRequestContext,
} from "../../app-logs/app-log-security-writer";
import { getUserSecurityRepository } from "./get-user-repository.service";

// Reason persisted in the LOGOUT row context. A successful password change
// or reset always invalidates the active session: a fresh credential should
// not coexist with a JWT signed against the previous fingerprint. Manual
// logout is NOT a reason here — that flow only blacklists the JWT (handled
// by the controllers), it does not clear the DB session, so trust-token
// reconnect remains possible.
export type SessionTerminationReason = "PASSWORD_RESET" | "PASSWORD_CHANGED";

// Clears any active session and emits a LOGOUT entry in app_log_security.
// Usagers don't have a server-side session row (portail-usagers login never
// fills currentSession / fingerprintHash), so only the audit log is emitted
// for that profile.
export async function terminateUserSession({
  userProfile,
  userId,
  reason,
  structureId,
  role,
  requestContext,
}: {
  userProfile: UserProfile;
  userId: number;
  reason: SessionTerminationReason;
  structureId?: number;
  role?: string;
  requestContext?: SecurityLogRequestContext;
}): Promise<void> {
  if (userProfile !== "usager") {
    const securityRepository = getUserSecurityRepository(userProfile);
    await securityRepository.update(
      { userId },
      { currentSession: null, fingerprintHash: null }
    );
  }

  await logSecurityEvent({
    action: "LOGOUT",
    profile: userProfile,
    userId,
    structureId,
    role: role as never,
    requestContext,
    context: { reason },
  });
}
