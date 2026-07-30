import { OtpErrorCode } from "@domifa/common";

export const OTP_PURPOSES = [
  "LOGIN",
  "EXPORT_STRUCTURE_USAGERS",
  "EXPORT_PORTAIL_USAGERS_ACCOUNTS",
  "EXPORT_ADMIN_STATS_DEPLOIEMENT",
  "RESET_USAGERS",
  "DOWNLOAD_MULTIPLE_DOCS",
  "DELETE_STRUCTURE",
  "UNBLOCK_USER",
  "DELETE_USER_BY_ADMIN",
] as const;

export type OtpPurpose = (typeof OTP_PURPOSES)[number];

export interface OtpPromptOptions {
  purpose: OtpPurpose;
  previousErrorCode?: OtpErrorCode;
}

export type OtpPromptResult =
  | { kind: "submit"; code: string }
  | { kind: "resend" }
  | { kind: "cancel" }
  | { kind: "blocked" };
