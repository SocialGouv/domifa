import {
  OTP_EXPIRATION_MINUTES,
  OTP_RESEND_COOLDOWN_SECONDS,
} from "@domifa/common";

export { OTP_EXPIRATION_MINUTES };
export const OTP_BLOCK_DURATION_MINUTES = 60;

// Derived (ms). Preferred at call sites — avoids the * 60 * 1000 inline math.
export const OTP_EXPIRATION_MS = OTP_EXPIRATION_MINUTES * 60 * 1000;
export const OTP_BLOCK_DURATION_MS = OTP_BLOCK_DURATION_MINUTES * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = OTP_RESEND_COOLDOWN_SECONDS * 1000;

// Per-user rolling cap on OTP_REQUESTED rows over a 1-hour window (all
// purposes). Reaching it marks the account TEMPORARILY_BLOCKED via
// markAccountTemporarilyBlocked. RESET_PASSWORD_SUCCESS clears the counter.
export const OTP_MAX_REQUESTS_PER_HOUR = 10;

// Header non-préfixé : RFC 6648 (2012) déprécie le préfixe `X-` pour les
// headers custom. Express normalise toutes les clés en lowercase côté
// `req.headers`, donc la lecture marche quelle que soit la casse envoyée.
export const OTP_CODE_HEADER = "otp-code";

// Domains whose mail filters occasionally quarantine Brevo emails. For these
// recipients the OTP is fired via BOTH Brevo AND the Tipimail SMTP relay
// (DOMIFA_SMTP_* config) with the same code, so the user receives at least
// one. Everyone else stays on Brevo-only.
export const OTP_DUAL_SEND_DOMAINS: readonly string[] = [
  "mulhouse-alsace.fr",
  "akatij.fr",
  "ville-smlt.fr",
  "mairie-chateaubernard.fr",
];

// Hardcoded FROM for Tipimail SMTP. DKIM/SPF are configured on
// diffusion.fabrique.social.gouv.fr — the FROM MUST stay on this domain
// otherwise deliverability tanks on ISPs that enforce DMARC alignment. We
// intentionally ignore DOMIFA_SMTP_FROM here so a misconfigured env var in
// prod cannot break Tipimail delivery.
export const OTP_TIPIMAIL_FROM =
  "DomiFa <ne-pas-repondre@diffusion.fabrique.social.gouv.fr>";
