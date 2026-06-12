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

// Domains for which we bypass Brevo and hand the OTP to Tipimail via the
// existing SMTP relay (DOMIFA_SMTP_* config), regardless of otpProvider.
// Empty by default — all recipients go through Brevo.
export const OTP_FORCED_SMTP_DOMAINS: readonly string[] = [];
