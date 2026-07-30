import { OtpRequestContext } from "../otp.types";

export function buildScopeKey(context: OtpRequestContext) {
  return {
    fingerprintHash: context.fingerprintHash,
    url: context.url,
    purpose: context.purpose,
  };
}
