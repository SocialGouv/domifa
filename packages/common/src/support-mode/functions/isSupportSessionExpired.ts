import { SupportSession } from "../interfaces/SupportSession.interface";

// `status === "ACTIVE"` only reflects what the expiry cron has processed so
// far: an attachment is over as soon as its expiresAt is reached.
export const isSupportSessionExpired = (
  session: Pick<SupportSession, "expiresAt">,
  now: Date = new Date()
): boolean => new Date(session.expiresAt).getTime() <= now.getTime();
