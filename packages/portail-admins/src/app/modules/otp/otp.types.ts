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

export type OtpErrorCode =
  | "OTP_REQUIRED"
  | "OTP_INVALID"
  | "OTP_BLOCKED"
  | "OTP_RESEND_LIMIT";

export interface OtpErrorBody {
  code: OtpErrorCode;
}

export interface OtpPromptOptions {
  purpose: OtpPurpose;
  previousErrorCode?: OtpErrorCode;
}

export type OtpPromptResult =
  | { kind: "submit"; code: string }
  | { kind: "cancel" }
  | { kind: "blocked" };
