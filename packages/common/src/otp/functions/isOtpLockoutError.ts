import { OtpErrorCode } from "../types/OtpErrorCode.type";

// Lockout: the user hit a rate-limit or exhausted their attempts. The OTP
// modal must close because the user has to wait (or trigger a fresh flow)
// rather than re-submit a code inline.
export function isOtpLockoutError(code: OtpErrorCode): boolean {
  return code === "OTP_SCOPE_LOCKED" || code === "OTP_USER_RATE_LIMITED";
}
