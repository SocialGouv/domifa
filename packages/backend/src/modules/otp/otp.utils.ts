import { OTP_FORCED_SMTP_DOMAINS } from "./otp.constants";

export function redactEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) {
    return "***";
  }
  return `${local.slice(0, 1)}***@${domain}`;
}

export function shouldForceSmtpForDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) {
    return false;
  }
  return OTP_FORCED_SMTP_DOMAINS.includes(domain);
}
