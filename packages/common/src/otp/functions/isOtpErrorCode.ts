import { OTP_ERROR_CODES } from "../constants/OTP_ERROR_CODES.const";
import { OtpErrorCode } from "../types/OtpErrorCode.type";

export function isOtpErrorCode(value: unknown): value is OtpErrorCode {
  return (
    typeof value === "string" &&
    (OTP_ERROR_CODES as readonly string[]).includes(value)
  );
}
