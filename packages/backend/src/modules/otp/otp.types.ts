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
] as const;

export type OtpPurpose = (typeof OTP_PURPOSES)[number];

export interface AuthenticatedOtpUser {
  uuid: string;
  email: string;
  _userProfile: UserProfile;
}

export interface OtpRequestContext {
  fingerprintHash: string;
  url: string;
  purpose: OtpPurpose;
  email: string;
  userType: UserProfile;
  userUuid: string;
}
