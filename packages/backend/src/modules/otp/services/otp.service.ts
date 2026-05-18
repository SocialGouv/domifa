import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { domifaConfig } from "../../../config";
import { myDataSource, otpRepository } from "../../../database";
import { acquireAdvisoryXactLock } from "../../../database/services/_postgres";
import {
  OTP_BLOCK_DURATION_MINUTES,
  OTP_EXPIRATION_MINUTES,
  OTP_MAX_ATTEMPTS,
} from "../otp.constants";
import { recordTestOtpCode } from "../otp-test-sink";
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
    // Serialize concurrent generate/resend on the same OTP scope. Without
    // this, two parallel requests would both pass the "no active OTP" check
    // and create two rows, or both pass the resendCount check and bypass
    // the OTP_MAX_RESENDS cap.
    return myDataSource.transaction(async (manager) => {
      await acquireAdvisoryXactLock(manager, otpScopeLockKey(context));
      return this.doGenerateOrResend(context);
    });
  }

  private async doGenerateOrResend(
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
      // No silent resend: an existing OTP is still valid → just signal
      // OTP_REQUIRED with its expiresAt. The user reuses the code received
      // on the first send. A future "Renvoyer" button will need its own
      // explicit endpoint to mint+send a fresh code; until then, the user
      // waits out the OTP_EXPIRATION_MINUTES window before a new OTP cycle.
      this.logger.log(
        `OTP existant reutilise pour ${emailLog} (purpose=${
          context.purpose
        }, expire=${existing.expiresAt.toISOString()})`
      );
      return { kind: "generated", expiresAt: existing.expiresAt };
    }

    const code = randomInt(100000, 1000000).toString();
    recordTestOtpCode(context.userUuid, code);
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    await otpRepository.createOtp({
      email: context.email,
      code: this.hmacCode(code),
      expiresAt,
      purpose: context.purpose,
      fingerprintHash: context.fingerprintHash,
      url: context.url,
      userType: context.userType,
      userUuid: context.userUuid,
    });

    this.logger.log(
      `OTP genere pour ${emailLog} (purpose=${
        context.purpose
      }, expire=${expiresAt.toISOString()})`
    );

    await this.otpEmailService.sendOtpEmail(
      context.email,
      code,
      context.purpose
    );

    return {
      kind: "generated",
      expiresAt,
    };
  }

  // Single entry point usable from both the JWT-protected OtpGuard and the
  // unauthenticated login path. Resolves to void on success, throws an
  // HttpException with a stable `code` payload on any rejection so callers
  // can react uniformly (OTP_REQUIRED / OTP_INVALID / OTP_BLOCKED).
  async enforceOrThrow(
    context: OtpRequestContext,
    code: string | null
  ): Promise<void> {
    if (code) {
      const result = await this.claim(context, code);
      if (result.valid === true) {
        return;
      }
      if (result.reason === "blocked") {
        throw otpHttpError("OTP_BLOCKED", HttpStatus.TOO_MANY_REQUESTS);
      }
      throw otpHttpError("OTP_INVALID", HttpStatus.UNAUTHORIZED);
    }

    const result = await this.generateOrResend(context);
    if (result.kind === "blocked") {
      throw otpHttpError("OTP_BLOCKED", HttpStatus.TOO_MANY_REQUESTS);
    }
    if (result.kind === "resend_limit_reached") {
      throw otpHttpError("OTP_RESEND_LIMIT", HttpStatus.TOO_MANY_REQUESTS);
    }
    throw otpHttpError("OTP_REQUIRED", HttpStatus.UNAUTHORIZED);
  }

  async claim(context: OtpRequestContext, code: string): Promise<ClaimResult> {
    // Serialize concurrent claims on the same OTP scope. Closes the TOCTOU
    // between findActiveByFingerprint and incrementPendingAttempts that
    // would otherwise let N parallel requests get N free HMAC comparisons
    // against the stored code before the attempts counter ever increments.
    return myDataSource.transaction(async (manager) => {
      await acquireAdvisoryXactLock(manager, otpScopeLockKey(context));
      return this.doClaim(context, code);
    });
  }

  private async doClaim(
    context: OtpRequestContext,
    code: string
  ): Promise<ClaimResult> {
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

// Stable lock key for advisory locks. fingerprintHash already encodes
// (userUuid, purpose, url), so it uniquely identifies the scope we want to
// serialize on. Prefix with "otp:" to avoid collisions with future advisory
// locks taken elsewhere in the codebase.
function otpScopeLockKey(context: OtpRequestContext): string {
  return `otp:${context.fingerprintHash}`;
}

function otpHttpError(code: string, status: HttpStatus): HttpException {
  return new HttpException({ code }, status);
}
