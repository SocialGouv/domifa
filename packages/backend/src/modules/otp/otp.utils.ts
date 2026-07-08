import { OTP_DUAL_SEND_DOMAINS } from "./otp.constants";

export function redactEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) {
    return "***";
  }
  return `${local.slice(0, 1)}***@${domain}`;
}

export function shouldDualSendForDomain(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) {
    return false;
  }
  return OTP_DUAL_SEND_DOMAINS.includes(domain);
}
