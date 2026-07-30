export const OTP_ERROR_CODES = [
  "OTP_REQUIRED",
  "OTP_CODE_INVALID",
  "OTP_CODE_EXPIRED",
  "OTP_SCOPE_LOCKED",
  "OTP_USER_RATE_LIMITED",
] as const;

export type OtpErrorCode = (typeof OTP_ERROR_CODES)[number];

export const OTP_ERROR_LABELS: Record<OtpErrorCode, string> = {
  OTP_REQUIRED: "Un code de confirmation vient de vous être envoyé par email.",
  OTP_CODE_INVALID: "Code incorrect. Veuillez ressaisir le code.",
  OTP_CODE_EXPIRED: "Ce code a expiré. Demandez un nouveau code.",
  OTP_SCOPE_LOCKED:
    "Trop de codes erronés. Cette action est verrouillée temporairement.",
  OTP_USER_RATE_LIMITED:
    "Trop de demandes de code. Votre compte est temporairement bloqué pour votre sécurité.",
};

export function isOtpErrorCode(value: unknown): value is OtpErrorCode {
  return (
    typeof value === "string" &&
    (OTP_ERROR_CODES as readonly string[]).includes(value)
  );
}
