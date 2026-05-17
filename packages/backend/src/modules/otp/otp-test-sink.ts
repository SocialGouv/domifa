// Test sink: in envId="test", SMTP is short-circuited (we never want the
// suite to talk to a real mail server). Without a way to surface the
// freshly minted plaintext OTP back to test infra, any OtpGuard-protected
// endpoint is untestable end-to-end. OtpService tees the code into this
// map ONLY when envId="test"; prod paths never touch it, so the prod
// attack surface is unchanged. Consumed by AppTestHttpClient to replay
// OTP-protected requests automatically.
import { domifaConfig } from "../../config";

const lastTestOtpByUserUuid = new Map<string, string>();

export function recordTestOtpCode(userUuid: string, code: string): void {
  if (domifaConfig().envId !== "test") {
    return;
  }
  lastTestOtpByUserUuid.set(userUuid, code);
}

export function peekTestOtpCode(userUuid: string): string | null {
  return lastTestOtpByUserUuid.get(userUuid) ?? null;
}

export function clearTestOtpCodes(): void {
  lastTestOtpByUserUuid.clear();
}
