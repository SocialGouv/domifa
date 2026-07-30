import { OtpErrorCode } from "@domifa/common";

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

export interface OtpPromptOptions {
  purpose: OtpPurpose;
  previousErrorCode?: OtpErrorCode;
}

export type OtpPromptResult =
  | { kind: "submit"; code: string }
  | { kind: "cancel" }
  | { kind: "blocked" };
