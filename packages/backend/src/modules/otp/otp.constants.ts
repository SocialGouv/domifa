export const OTP_EXPIRATION_MINUTES = 10;
export const OTP_MAX_ATTEMPTS = 3;
export const OTP_BLOCK_DURATION_MINUTES = 60;

// Max resends within the OTP's lifetime (= 10 min). Counted from the initial
// send: 0 = first send, 1 = first resend, 2 = second resend. At resendCount=2
// the user has received 3 codes total and any further demand for the same
// scope is refused until the OTP expires.
export const OTP_MAX_RESENDS = 2;

export const OTP_CODE_HEADER = "x-otp-code";
