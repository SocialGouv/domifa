import { createHash } from "node:crypto";
import { Request } from "express";

import {
  getClientIp,
  getClientUserAgent,
} from "../../util/express/clientRequest.helper";
import { AuthenticatedOtpUser, OtpPurpose } from "./otp.types";

// Stable hash of (user, client, purpose) used to scope OTP entries.
// Unrelated to the session fingerprint carried by the JWT — that one is
// for token-binding and stays a session/auth concern.
export function computeOtpFingerprint(
  req: Request,
  user: AuthenticatedOtpUser,
  purpose: OtpPurpose
): string {
  const ip = getClientIp(req);
  const userAgent = getClientUserAgent(req);

  return createHash("sha256")
    .update(`${user.uuid}|${ip}|${userAgent}|${purpose}`)
    .digest("hex");
}
