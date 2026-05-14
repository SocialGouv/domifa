import { createHash } from "node:crypto";

import { AuthenticatedOtpUser, OtpPurpose } from "./otp.types";

// Stable hash scoping OTP entries to (user, purpose, url). IP and User-Agent
// are intentionally NOT included: they're already enforced by the session
// fingerprint check on the JWT (jwt.strategy.ts), so adding them here only
// breaks legit users whose network flaps (mobile data ↔ wifi) without buying
// any extra defense against a stolen-JWT scenario.
export function computeOtpFingerprint(
  user: AuthenticatedOtpUser,
  purpose: OtpPurpose,
  url: string
): string {
  return createHash("sha256")
    .update(`${user.uuid}|${purpose}|${url}`)
    .digest("hex");
}
