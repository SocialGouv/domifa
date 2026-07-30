import { SetMetadata } from "@nestjs/common";
import { OtpPurpose } from "@domifa/common";

export const OTP_PURPOSE_METADATA_KEY = "otp:purpose";

export const RequireOtp = (purpose: OtpPurpose) =>
  SetMetadata(OTP_PURPOSE_METADATA_KEY, purpose);
