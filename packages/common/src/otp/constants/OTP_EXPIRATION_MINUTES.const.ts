// Lifetime of an OTP code. Shared so the UI copy ("Il est valable 30 minutes")
// and the emails always match the TTL enforced server side.
export const OTP_EXPIRATION_MINUTES = 30;
