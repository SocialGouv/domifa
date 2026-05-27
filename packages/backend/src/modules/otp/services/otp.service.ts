import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { domifaConfig } from "../../../config";
import { myDataSource, otpRepository } from "../../../database";
import { acquireAdvisoryXactLock } from "../../../database/services/_postgres";
import {
  OTP_BLOCK_DURATION_MINUTES,
  OTP_EXPIRATION_MINUTES,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_REQUESTS_PER_HOUR,
  OTP_MAX_RESENDS,
} from "../otp.constants";
import { recordTestOtpCode } from "../otp-test-sink";
import { OtpRequestContext } from "../otp.types";
import { redactEmail } from "../otp.utils";
import { OtpEmailService } from "./otp-email.service";
import { logSecurityEvent } from "../../app-logs/app-log-security-writer";
import { countSecurityEventsForUser } from "../../app-logs/app-log-security-counters";
import { markAccountTemporarilyBlocked } from "../../users/services/userSecurityEventHistoryManager.service";

export type GenerateOrResendResult =
  | { kind: "generated"; expiresAt: Date }
  | { kind: "resend_limit_reached"; expiresAt: Date }
  | { kind: "request_limit_reached" }
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

    if (await this.isRequestLimitReached(context)) {
      this.logger.warn(
        `OTP refuse (${OTP_MAX_REQUESTS_PER_HOUR}/h) pour ${emailLog} (purpose=${context.purpose})`
      );
      await this.blockAccountForOtpFlood(context);
      return { kind: "request_limit_reached" };
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

    await this.otpEmailService.sendOtpEmail({
      email: context.email,
      prenom: context.prenom,
      code,
      purpose: context.purpose,
    });

    await this.logOtpEvent(context, "OTP_REQUESTED");

    return {
      kind: "generated",
      expiresAt,
    };
  }

  // Single entry point usable from both the JWT-protected OtpGuard and the
  // unauthenticated login path. Resolves to void on success, throws an
  // HttpException with a stable `code` payload on any rejection so callers
  // can react uniformly (OTP_REQUIRED / OTP_INVALID / OTP_BLOCKED).
  // `forceResend` bypasses the "reuse existing OTP" shortcut and explicitly
  // mints a fresh code (subject to OTP_MAX_RESENDS). Ignored when `code` is
  // provided — a submitted code is always claimed against the current OTP.
  async enforceOrThrow(
    context: OtpRequestContext,
    code: string | null,
    options: { forceResend?: boolean } = {}
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

    const result = options.forceResend
      ? await this.resend(context)
      : await this.generateOrResend(context);
    if (result.kind === "blocked") {
      throw otpHttpError("OTP_BLOCKED", HttpStatus.TOO_MANY_REQUESTS);
    }
    if (result.kind === "resend_limit_reached") {
      throw otpHttpError("OTP_RESEND_LIMIT", HttpStatus.TOO_MANY_REQUESTS);
    }
    if (result.kind === "request_limit_reached") {
      throw otpHttpError("BLOCKED_TEMP", HttpStatus.TOO_MANY_REQUESTS);
    }
    throw otpHttpError("OTP_REQUIRED", HttpStatus.UNAUTHORIZED);
  }

  // Explicit "Renvoyer le code" path: mints a fresh 6-digit code, overwrites
  // the existing OTP row's HMAC and bumps resendCount atomically, then re-
  // sends the email. Refuses past OTP_MAX_RESENDS. If no active OTP is found,
  // falls back to generateOrResend so the caller still gets a code (covers
  // the edge case where the OTP expired between modal open and resend click).
  async resend(context: OtpRequestContext): Promise<GenerateOrResendResult> {
    return myDataSource.transaction(async (manager) => {
      await acquireAdvisoryXactLock(manager, otpScopeLockKey(context));
      return this.doResend(context);
    });
  }

  private async doResend(
    context: OtpRequestContext
  ): Promise<GenerateOrResendResult> {
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
        `OTP resend refuse (block actif) pour ${emailLog} (purpose=${context.purpose})`
      );
      return { kind: "blocked", retryAt };
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

    if (!existing) {
      // OTP expired (or never created) between modal open and resend click.
      // Fall back to the normal mint path so the user still receives a code.
      return this.doGenerateOrResend(context);
    }

    if (existing.resendCount >= OTP_MAX_RESENDS) {
      this.logger.warn(
        `OTP resend refuse (limite ${OTP_MAX_RESENDS}) pour ${emailLog} (purpose=${context.purpose})`
      );
      return { kind: "resend_limit_reached", expiresAt: existing.expiresAt };
    }

    if (await this.isRequestLimitReached(context)) {
      this.logger.warn(
        `OTP resend refuse (${OTP_MAX_REQUESTS_PER_HOUR}/h) pour ${emailLog} (purpose=${context.purpose})`
      );
      await this.blockAccountForOtpFlood(context);
      return { kind: "request_limit_reached" };
    }

    const code = randomInt(100000, 1000000).toString();
    recordTestOtpCode(context.userUuid, code);
    const refreshed = await otpRepository.refreshCodeAndIncrementResend(
      existing.uuid,
      this.hmacCode(code)
    );
    if (!refreshed) {
      // Race: row claimed or deleted between findActive and refresh. Re-enter
      // the normal generate path so the user gets a usable code.
      return this.doGenerateOrResend(context);
    }

    this.logger.log(
      `OTP renvoye pour ${emailLog} (purpose=${context.purpose}, resendCount=${refreshed.resendCount})`
    );

    await this.otpEmailService.sendOtpEmail({
      email: context.email,
      prenom: context.prenom,
      code,
      purpose: context.purpose,
    });

    await this.logOtpEvent(context, "OTP_REQUESTED");

    return { kind: "generated", expiresAt: existing.expiresAt };
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
        await this.logOtpEvent(context, "OTP_SUCCESS");
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
    await this.logOtpEvent(context, "OTP_ERROR");
    return { valid: false, reason: "invalid_or_expired" };
  }

  // Writes an app_log_security row for an OTP event. When the caller supplied
  // `userId` in the context, the row is attributed to the matching numeric FK
  // column (userStructureId / userSupervisorId / userUsagerId); otherwise the
  // row is recorded under `anonymous` with the email preserved in `context`.
  private async logOtpEvent(
    context: OtpRequestContext,
    action: "OTP_REQUESTED" | "OTP_SUCCESS" | "OTP_ERROR"
  ): Promise<void> {
    await logSecurityEvent({
      action,
      profile: context.userId ? context.userType : undefined,
      userType: context.userId ? undefined : "anonymous",
      userId: context.userId,
      structureId: context.structureId,
      identifier: context.email,
      context: {
        purpose: context.purpose,
        url: context.url,
        userUuid: context.userUuid,
      },
    });
  }

  // Marks the account as TEMPORARILY_BLOCKED and writes a BLOCK_USER row in
  // app_log_security when the per-hour OTP cap is reached. Aligned with the
  // failed-password backoff path (userSecurityEventHistoryManager) so both
  // lockout triggers surface identically on the security audit tab. No-op
  // when the OTP context wasn't resolved to a numeric user id (anonymous).
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
    });
  }

  // Counts OTP_REQUESTED rows in app_log_security for this user over the last
  // hour, ignoring entries older than the most recent RESET_PASSWORD_SUCCESS
  // (so a fresh password reset clears the rate-limit). Returns true if the
  // cap (OTP_MAX_REQUESTS_PER_HOUR) is reached.
  private async isRequestLimitReached(
    context: OtpRequestContext
  ): Promise<boolean> {
    if (!context.userId) {
      // No user resolved (e.g. login OTP on an unknown account). The legacy
      // OTP-row throttles still apply; we just can't enforce the per-user cap
      // without an identity.
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
