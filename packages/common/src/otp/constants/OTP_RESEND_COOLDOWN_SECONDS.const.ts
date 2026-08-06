// Minimum delay between two OTP emails for the same scope. Enforced client
// side (the "Renvoyer le code" button stays disabled) and server side, so a
// caller bypassing the UI can't turn the resend into a mail flood.
export const OTP_RESEND_COOLDOWN_SECONDS = 60;
