// Minimum delay between two OTP emails for the same scope. Enforced client
// side (the "Envoyer un nouveau code" button stays disabled) and server side,
// so a caller bypassing the UI can't turn the resend into a mail flood. Set to
// 5 minutes: successive requests used to pile up and hit the hourly cap, which
// temporarily blocks the account.
export const OTP_RESEND_COOLDOWN_SECONDS = 300;
