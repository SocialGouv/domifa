import { Injectable, Logger } from "@nestjs/common";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { domifaConfig } from "../../../config";
import { otpRepository } from "../../../database";
import {
  OTP_BLOCK_DURATION_MINUTES,
  OTP_EXPIRATION_MINUTES,
  OTP_MAX_ATTEMPTS,
} from "../otp.constants";
import { OtpRequestContext } from "../otp.types";
import { redactEmail } from "../otp.utils";
import { OtpEmailService } from "./otp-email.service";

export type GenerateOrResendResult =
  | { kind: "generated"; expiresAt: Date }
  | { kind: "resend_limit_reached"; expiresAt: Date }
  | { kind: "blocked"; retryAt: Date };

export type ClaimResult =
  | { valid: true }
  | { valid: false; reason: "invalid_or_expired" }
  | { valid: false; reason: "blocked"; retryAt: Date };

@Injectable()
export class OtpService {
  private readonly logger = new Logger("OtpService");

  constructor(private readonly otpEmailService: OtpEmailService) {}

  async generateOrResend(
    context: OtpRequestContext
  ): Promise<GenerateOrResendResult> {
    const emailLog = redactEmail(context.email);
    const candidate = await otpRepository.findActiveByFingerprint(
      context.fingerprintHash,
      OTP_MAX_ATTEMPTS,
      context.userUuid
    );
    const existing =
      candidate?.url === context.url && candidate?.purpose === context.purpose
        ? candidate
        : null;

    const blockKey = {
      fingerprintHash: context.fingerprintHash,
      url: context.url,
      purpose: context.purpose,
    };
    const blockMs = OTP_BLOCK_DURATION_MINUTES * 60 * 1000;
    const blocked = await otpRepository.findRecentBlocked(
      blockKey,
      OTP_MAX_ATTEMPTS,
      blockMs
    );
    if (blocked) {
      const retryAt = new Date(blocked.updatedAt!.getTime() + blockMs);
      this.logger.warn(
        `OTP block actif pour ${emailLog} (purpose=${
          context.purpose
        }, retryAt=${retryAt.toISOString()})`
      );
      return { kind: "blocked", retryAt };
    }

    if (existing) {
      // Anti-flood: refuse to mint a second OTP while one is still active for
      // this scope. The user must wait for it to expire before requesting a
      // new code — prevents email-bombing the recipient via the resend path.
      this.logger.warn(
        `OTP resend refuse (OTP actif jusqu'a ${existing.expiresAt.toISOString()}) pour ${emailLog} (purpose=${
          context.purpose
        })`
      );
      return { kind: "resend_limit_reached", expiresAt: existing.expiresAt };
    }

    const code = randomInt(100000, 1000000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    await otpRepository.createOtp({
      email: context.email,
      code: this.hmacCode(code),
      expiresAt,
      purpose: context.purpose,
      fingerprintHash: context.fingerprintHash,
      url: context.url,
      userType: context.userType,
      userUuid: context.userUuid ?? null,
    });

    this.logger.log(
      `OTP genere pour ${emailLog} (purpose=${
        context.purpose
      }, expire=${expiresAt.toISOString()})`
    );

    await this.otpEmailService.sendOtpEmail(context.email, code);

    return {
      kind: "generated",
      expiresAt,
    };
  }

  async claim(context: OtpRequestContext, code: string): Promise<ClaimResult> {
    const emailLog = redactEmail(context.email);

    const blockKey = {
      fingerprintHash: context.fingerprintHash,
      url: context.url,
      purpose: context.purpose,
    };
    const blockMs = OTP_BLOCK_DURATION_MINUTES * 60 * 1000;
    const blocked = await otpRepository.findRecentBlocked(
      blockKey,
      OTP_MAX_ATTEMPTS,
      blockMs
    );
    if (blocked) {
      const retryAt = new Date(blocked.updatedAt!.getTime() + blockMs);
      this.logger.warn(
        `OTP claim refuse (block actif) pour ${emailLog} (purpose=${context.purpose})`
      );
      return { valid: false, reason: "blocked", retryAt };
    }

    const candidate = await otpRepository.findActiveByFingerprint(
      context.fingerprintHash,
      OTP_MAX_ATTEMPTS,
      context.userUuid
    );
    const existing =
      candidate?.url === context.url && candidate?.purpose === context.purpose
        ? candidate
        : null;

    if (existing && constantTimeEquals(existing.code, this.hmacCode(code))) {
      const claimed = await otpRepository.claimByKey(
        {
          fingerprintHash: context.fingerprintHash,
          url: context.url,
          purpose: context.purpose,
        },
        existing.code,
        OTP_MAX_ATTEMPTS
      );
      if (claimed) {
        this.logger.log(
          `OTP claim OK pour ${emailLog} (purpose=${context.purpose})`
        );
        return { valid: true };
      }
    }

    const incremented = await otpRepository.incrementPendingAttempts(
      {
        fingerprintHash: context.fingerprintHash,
        url: context.url,
        purpose: context.purpose,
      },
      OTP_MAX_ATTEMPTS
    );
    if (incremented) {
      this.logger.debug(
        `OTP claim KO pour ${emailLog}: code invalide (tentative ${incremented.attempts}/${OTP_MAX_ATTEMPTS})`
      );
    } else {
      this.logger.debug(`OTP claim KO pour ${emailLog}: aucun OTP eligible`);
    }
    return { valid: false, reason: "invalid_or_expired" };
  }

  // HMAC-SHA256 keyed with the server-side OTP secret. Refuses to run when
  // the secret is missing — we never want to silently fall back to plain
  // SHA-256 (which would be reversible from a DB dump for the 6-digit
  // keyspace).
  private hmacCode(code: string): string {
    const secret = domifaConfig().security.otpSecret;
    if (!secret) {
      throw new Error(
        "DOMIFA_OTP_SECRET is not configured — refusing to issue or verify OTPs"
      );
    }
    return createHmac("sha256", secret).update(code).digest("hex");
  }
}

function constantTimeEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}
