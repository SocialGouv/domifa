import { OTP_RESEND_LABEL } from "../constants/OTP_RESEND_LABELS.const";

// Countdown label of the resend button: "Envoyer un nouveau code dans 4:56",
// switching to "dans 45 secondes" below one minute.
export function buildOtpResendWaitLabel(remainingSeconds: number): string {
  const totalSeconds = Math.max(0, Math.ceil(remainingSeconds));
  if (totalSeconds < 60) {
    return `${OTP_RESEND_LABEL} dans ${totalSeconds} seconde${
      totalSeconds > 1 ? "s" : ""
    }`;
  }
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${OTP_RESEND_LABEL} dans ${minutes}:${seconds
    .toString()
    .padStart(2, "0")}`;
}
