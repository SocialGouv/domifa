import { HttpException, HttpStatus } from "@nestjs/common";
import { ApiMessage, OtpErrorCode } from "@domifa/common";

import { OtpOutcome } from "./otp-outcome.types";

export function otpOutcomeToHttp(outcome: OtpOutcome): HttpException {
  if (outcome.kind === "scope_locked") {
    return buildOtpHttpError("OTP_SCOPE_LOCKED", HttpStatus.TOO_MANY_REQUESTS);
  }
  if (outcome.kind === "user_rate_limited") {
    return buildOtpHttpError(
      "OTP_USER_RATE_LIMITED",
      HttpStatus.TOO_MANY_REQUESTS
    );
  }
  if (outcome.kind === "invalid") {
    return buildOtpHttpError("OTP_CODE_INVALID", HttpStatus.UNAUTHORIZED);
  }
  if (outcome.kind === "expired") {
    return buildOtpHttpError("OTP_CODE_EXPIRED", HttpStatus.UNAUTHORIZED);
  }
  if (outcome.kind === "issued" || outcome.kind === "already_active") {
    return buildOtpHttpError("OTP_REQUIRED", HttpStatus.UNAUTHORIZED);
  }
  throw new Error("otpOutcomeToHttp called on ok outcome");
}

function buildOtpHttpError(
  code: OtpErrorCode,
  status: HttpStatus
): HttpException {
  const body: ApiMessage = { message: code };
  return new HttpException(body, status);
}
