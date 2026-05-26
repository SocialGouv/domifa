export const OTP_EXPIRATION_MINUTES = 30;
export const OTP_MAX_ATTEMPTS = 3;
export const OTP_BLOCK_DURATION_MINUTES = 60;

// Max resends within the OTP's lifetime (= 30 min). Counted from the initial
// send: 0 = first send, 1 = first resend, 2 = second resend. At resendCount=5
// the user has received 6 codes total and any further demand for the same
// scope is refused until the OTP expires.
export const OTP_MAX_RESENDS = 5;

// Header non-préfixé : RFC 6648 (2012) déprécie le préfixe `X-` pour les
// headers custom. Express normalise toutes les clés en lowercase côté
// `req.headers`, donc la lecture marche quelle que soit la casse envoyée.
export const OTP_CODE_HEADER = "otp-code";
export const OTP_RESEND_HEADER = "otp-resend";
