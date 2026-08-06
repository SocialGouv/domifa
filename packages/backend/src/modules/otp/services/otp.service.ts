import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { createHmac, randomInt } from "node:crypto";
import { EntityManager } from "typeorm";

import { OTP_MAX_ATTEMPTS } from "@domifa/common";

import { domifaConfig } from "../../../config";
import { myDataSource, otpRepository } from "../../../database";
import { ActiveOtpHmac } from "../../../database/services/otp/otpRepository.service";
import { acquireAdvisoryXactLock } from "../../../database/services/_postgres";
import {
  OTP_BLOCK_DURATION_MS,
  OTP_EXPIRATION_MS,
  OTP_MAX_REQUESTS_PER_HOUR,
  OTP_RESEND_COOLDOWN_MS,
} from "../otp.constants";
import { recordTestOtpCode } from "../otp-test-sink";
import { OtpRequestContext } from "../otp.types";
import { redactEmail } from "../otp.utils";
import { OtpEmailService } from "./otp-email.service";
import { logSecurityEvent } from "../../app-logs/app-log-security-writer";
import { countSecurityEventsForUser } from "../../app-logs/app-log-security-counters";
import { markAccountTemporarilyBlocked } from "../../users/services/userSecurityEventHistoryManager.service";
import { OtpOutcome } from "./otp-outcome.types";
import { otpOutcomeToHttp } from "./otp-outcome-to-http";
import { buildScopeKey } from "./otp-scope.helpers";

@Injectable()
export class OtpService {
  private readonly logger = new Logger("OtpService");

  constructor(private readonly otpEmailService: OtpEmailService) {}

  // Only entry point. Throws HttpException with an ApiMessage body whose
  // `message` field carries an OtpErrorCode. Never resolves to a value —
  // either the OTP step passes (returns void) or an error is thrown that the
  // guard/controller propagates verbatim.
  async requireValidOtp(
    context: OtpRequestContext,
    code: string | null
  ): Promise<void> {
    if (code) {
      await this.claimOrThrow(context, code);
      return;
    }
    await this.sendOtpOrThrow(context);
  }

  private async claimOrThrow(
    context: OtpRequestContext,
    code: string
  ): Promise<void> {
    const outcome = await this.withScopeLock(context, () =>
      this.verifyAndConsumeOtp(context, code)
    );

    if (outcome.kind === "ok") {
      // Audit + email are out of the lock/tx: they don't affect the claim
      // decision and would otherwise hold the advisory lock during I/O.
      await this.logOtpEvent(context, "OTP_SUCCESS");
      return;
    }
    if (outcome.kind === "invalid") {
      await this.logOtpEvent(context, "OTP_ERROR");
    }
    throw otpOutcomeToHttp(outcome);
  }

  private async sendOtpOrThrow(context: OtpRequestContext): Promise<void> {
    const outcome = await this.withScopeLock(context, () =>
      this.ensureActiveOtp(context)
    );

    if (outcome.kind === "user_rate_limited") {
      // Sync-lock + account block are the OTP issue decision, out of lock is fine.
      await this.blockAccountForOtpFlood(context);
      throw otpOutcomeToHttp(outcome);
    }
    if (outcome.kind === "scope_locked") {
      throw otpOutcomeToHttp(outcome);
    }

    if (outcome.kind === "issued") {
      await this.logOtpEvent(context, "OTP_REQUESTED");
      await this.otpEmailService.sendOtpEmail({
        email: context.email,
        prenom: context.prenom,
        code: outcome.plainCode,
        purpose: context.purpose,
      });
    }
    // "already_active" & "issued" both mean "one OTP is live for this scope":
    // tell the caller to prompt the user for it.
    throw otpOutcomeToHttp(outcome);
  }

  // ── core primitives ────────────────────────────────────────────────

  private async ensureActiveOtp(
    context: OtpRequestContext
  ): Promise<OtpOutcome> {
    const blocked = await this.findBlockedRetryAt(context);
    if (blocked) {
      return { kind: "scope_locked", retryAt: blocked };
    }

    const existing = await this.findExistingActiveOtp(context);
    if (existing && !isOlderThanResendCooldown(existing)) {
      return { kind: "already_active" };
    }

    if (await this.isRequestLimitReached(context)) {
      const retryAt = new Date(Date.now() + OTP_BLOCK_DURATION_MS);
      return { kind: "user_rate_limited", retryAt };
    }

    const plainCode = randomInt(100000, 1000000).toString();
    recordTestOtpCode(context.userUuid, plainCode);
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MS);

    await otpRepository.invalidateActiveOtps(buildScopeKey(context));
    await otpRepository.createOtp({
      email: context.email,
      code: this.hmacCode(plainCode),
      expiresAt,
      purpose: context.purpose,
      fingerprintHash: context.fingerprintHash,
      url: context.url,
      userType: context.userType,
      userUuid: context.userUuid,
    });

    return { kind: "issued", plainCode };
  }

  private async verifyAndConsumeOtp(
    context: OtpRequestContext,
    submittedCode: string
  ): Promise<OtpOutcome> {
    const blocked = await this.findBlockedRetryAt(context);
    if (blocked) {
      return { kind: "scope_locked", retryAt: blocked };
    }

    const existing = await this.findExistingActiveOtp(context);
    if (!existing) {
      return { kind: "expired" };
    }

    if (existing.code === this.hmacCode(submittedCode)) {
      const claimed = await otpRepository.consumeOtpIfCodeMatches(
        buildScopeKey(context),
        existing.code,
        OTP_MAX_ATTEMPTS
      );
      if (claimed) {
        return { kind: "ok" };
      }
    }

    const incremented = await otpRepository.incrementPendingAttempts(
      buildScopeKey(context),
      OTP_MAX_ATTEMPTS
    );
    const attemptsRemaining = incremented
      ? Math.max(0, OTP_MAX_ATTEMPTS - incremented.attempts)
      : 0;
    return { kind: "invalid", attemptsRemaining };
  }

  // ── helpers ────────────────────────────────────────────────────────

  // Serializes concurrent generate/claim on the same (user, purpose, url).
  // Without it, parallel requests could bypass the attempts counter or
  // create two active OTPs for the same scope.
  private async withScopeLock<T>(
    context: OtpRequestContext,
    fn: (manager: EntityManager) => Promise<T>
  ): Promise<T> {
    return myDataSource.transaction(async (manager) => {
      await acquireAdvisoryXactLock(manager, `otp:${context.fingerprintHash}`);
      return fn(manager);
    });
  }

  private async findBlockedRetryAt(
    context: OtpRequestContext
  ): Promise<Date | null> {
    const blocked = await otpRepository.findRecentBlocked(
      buildScopeKey(context),
      OTP_MAX_ATTEMPTS,
      OTP_BLOCK_DURATION_MS
    );
    if (!blocked) {
      return null;
    }
    return new Date(blocked.updatedAt.getTime() + OTP_BLOCK_DURATION_MS);
  }

  // findActiveByFingerprint scopes on fingerprintHash which encodes
  // (userUuid, purpose, url); no post-filter needed.
  private async findExistingActiveOtp(
    context: OtpRequestContext
  ): Promise<ActiveOtpHmac | null> {
    return otpRepository.findActiveByFingerprint(
      context.fingerprintHash,
      OTP_MAX_ATTEMPTS,
      context.userUuid
    );
  }

  private async logOtpEvent(
    context: OtpRequestContext,
    action: "OTP_REQUESTED" | "OTP_SUCCESS" | "OTP_ERROR"
  ): Promise<void> {
    await logSecurityEvent({
      action,
      profile: context.userType,
      userId: context.userId,
      structureId: context.structureId,
      attemptedIdentifier: context.email,
      requestContext: { ip: context.ip, userAgent: context.userAgent },
      context: {
        purpose: context.purpose,
        url: context.url,
        userUuid: context.userUuid,
      },
    });
  }

  private async blockAccountForOtpFlood(
    context: OtpRequestContext
  ): Promise<void> {
    if (!context.userId) {
      return;
    }
    await markAccountTemporarilyBlocked({
      userProfile: context.userType,
      userId: context.userId,
      structureId: context.structureId,
      reason: "OTP_REQUEST_LIMIT",
      operation: `otp:${context.purpose}`,
      requestContext: { ip: context.ip, userAgent: context.userAgent },
    });
    this.logger.warn(
      `OTP flood → account blocked for ${redactEmail(context.email)} (purpose=${
        context.purpose
      })`
    );
  }

  // Counts OTP_REQUESTED rows for this user over the last hour, resetting
  // at the most recent RESET_PASSWORD_SUCCESS. When no userId is resolved
  // (login on unknown account), the per-user cap can't apply — scope-level
  // OTP throttles still do.
  private async isRequestLimitReached(
    context: OtpRequestContext
  ): Promise<boolean> {
    if (!context.userId) {
      return false;
    }
    const count = await countSecurityEventsForUser({
      profile: context.userType,
      userId: context.userId,
      actions: ["OTP_REQUESTED"],
      sinceMinutes: 60,
      resetByActions: ["RESET_PASSWORD_SUCCESS"],
    });
    return count >= OTP_MAX_REQUESTS_PER_HOUR;
  }

  // HMAC-SHA256 keyed with DOMIFA_OTP_SECRET. Refuses to run without the
  // secret — a silent fallback to plain SHA-256 would be reversible from a
  // DB dump for a 6-digit keyspace. Surfaced as a 500 rather than a bare
  // Error so the login flow reports a server failure instead of folding it
  // into "wrong credentials".
  private hmacCode(code: string): string {
    const secret = domifaConfig().security.otpSecret;
    if (!secret) {
      this.logger.error(
        "DOMIFA_OTP_SECRET is not configured — refusing to issue or verify OTPs"
      );
      throw new HttpException(
        { message: "OTP_UNAVAILABLE" },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    return createHmac("sha256", secret).update(code).digest("hex");
  }
}

// A new code is only generated once the cooldown has elapsed since the last
// one, so asking again in a loop can't turn into a mail flood.
function isOlderThanResendCooldown(existing: ActiveOtpHmac): boolean {
  if (!existing.createdAt) {
    return true;
  }
  return Date.now() - existing.createdAt.getTime() >= OTP_RESEND_COOLDOWN_MS;
}
