export const OTP_EXPIRATION_MINUTES = 30;
export const OTP_MAX_ATTEMPTS = 3;
export const OTP_BLOCK_DURATION_MINUTES = 60;

// Max resends within the OTP's lifetime (= 30 min). Counted from the initial
// send: 0 = first send, 1 = first resend, 2 = second resend. At resendCount=5
// the user has received 6 codes total and any further demand for the same
// scope is refused until the OTP expires.
export const OTP_MAX_RESENDS = 5;

// Per-user rolling cap on OTP_REQUESTED rows over a 1-hour window. Counted
// across every purpose (LOGIN, EXPORT, etc.) since the limit is about email
// volume — a single user can't trigger more than this many code emails per
// hour. Hitting the cap temporarily blocks the account (TEMPORARILY_BLOCKED
// + BLOCK_USER row in app_log_security). RESET_PASSWORD_SUCCESS resets the
// counter (see app-log-security backoff query).
export const OTP_MAX_REQUESTS_PER_HOUR = 10;

// Header non-préfixé : RFC 6648 (2012) déprécie le préfixe `X-` pour les
// headers custom. Express normalise toutes les clés en lowercase côté
// `req.headers`, donc la lecture marche quelle que soit la casse envoyée.
export const OTP_CODE_HEADER = "otp-code";
export const OTP_RESEND_HEADER = "otp-resend";

// Domains whose mail filters occasionally quarantine Brevo emails. For these
// recipients the OTP is fired via BOTH Brevo AND the Tipimail SMTP relay
// (DOMIFA_SMTP_* config) with the same code, so the user receives at least
// one. Everyone else stays on Brevo-only.
export const OTP_DUAL_SEND_DOMAINS: readonly string[] = [
  "fabrique.social.gouv.fr",
  "mulhouse-alsace.fr",
  "akatij.fr",
  "ville-smlt.fr",
];

// Hardcoded FROM for Tipimail SMTP. DKIM/SPF are configured on
// diffusion.fabrique.social.gouv.fr — the FROM MUST stay on this domain
// otherwise deliverability tanks on ISPs that enforce DMARC alignment. We
// intentionally ignore DOMIFA_SMTP_FROM here so a misconfigured env var in
// prod cannot break Tipimail delivery.
export const OTP_TIPIMAIL_FROM =
  "DomiFa <ne-pas-repondre@diffusion.fabrique.social.gouv.fr>";
