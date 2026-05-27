import { UserProfile } from "../../../_common/model";
import {
  logSecurityEvent,
  SecurityLogRequestContext,
  SessionTerminationReason,
} from "../../app-logs/app-log-security-writer";
import { getUserSecurityRepository } from "./get-user-repository.service";

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
  userName,
}: {
  userProfile: UserProfile;
  userId: number;
  reason: SessionTerminationReason;
  structureId?: number;
  role?: string;
  requestContext?: SecurityLogRequestContext;
  userName?: string;
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
    userName,
    context: { reason },
  });
}
