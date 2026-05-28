import { UserProfile } from "../../_common/model";

export const OTP_PURPOSES = [
  "LOGIN",
  "EXPORT",
  "RESET_USAGERS",
  "DOWNLOAD_MULTIPLE_DOCS",
  "DELETE_STRUCTURE",
  "UNBLOCK_USER",
  "BLOCK_USER_BY_ADMIN",
  "DELETE_USER_BY_ADMIN",
  "UNBLOCK_BREVO_CONTACT",
] as const;

export type OtpPurpose = (typeof OTP_PURPOSES)[number];

export interface AuthenticatedOtpUser {
  uuid: string;
  email: string;
  prenom: string;
  _userProfile: UserProfile;
}

export interface OtpRequestContext {
  fingerprintHash: string;
  url: string;
  purpose: OtpPurpose;
  email: string;
  prenom: string;
  userType: UserProfile;
  userUuid: string;
  // Optional: numeric DB id of the targeted user. Plumbed through from the
  // controller when it has the user row in hand. Used to attribute OTP_*
  // entries in app_log_security to a real userStructureId / userSupervisorId /
  // userUsagerId column instead of falling back to userType=anonymous.
  userId?: number;
  // Optional structureId for additional context (only meaningful for
  // structure / usager profiles — supervisors are multi-structure).
  structureId?: number;
  // HTTP client metadata captured at the call site (controller / guard). Kept
  // optional so non-HTTP callers can still build a context.
  ip?: string;
  userAgent?: string;
}
