import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import {
  CurrentUserSession,
  STRUCTURE_TRUST_JWT_SUBJECT,
  StructureTrustJwtPayload,
} from "../../_common/model";
import { domifaConfig } from "../../config";
import { computeOtpFingerprint } from "../../modules/otp/otp-fingerprint.helper";
import { OtpService } from "../../modules/otp/services/otp.service";
import { OtpRequestContext } from "../../modules/otp/otp.types";
import { redactEmail } from "../../modules/otp/otp.utils";
import { appLogger } from "../../util";
import { logSecurityEvent } from "../../modules/app-logs/app-log-security-writer";
import { SessionFingerprintService } from "./session-fingerprint.service";

export type TrustTokenRejectReason =
  | "expired"
  | "jwt_invalid"
  | "scope_mismatch"
  | "no_session"
  | "session_uuid_mismatch"
  | "hash_mismatch";

type TrustTokenResult =
  | { kind: "accepted"; session: CurrentUserSession }
  | { kind: "rejected"; reason: TrustTokenRejectReason };

// Scoping values for the login OTP. Stable across all login OTP requests so
// generateOrResend / claim hit the same row.
const LOGIN_OTP_URL = "POST /structures/auth/login";

export type LoginUserPrincipal = {
  id: number;
  uuid: string;
  email: string;
  prenom: string;
  // Optional: passed through to OtpRequestContext so OTP_* rows in
  // app_log_security can be attributed to the right structure scope.
  // Supervisor users are multi-structure → undefined.
  structureId?: number;
};

export type LoginOtpResult =
  | { kind: "trusted"; session: CurrentUserSession }
  | { kind: "otp_validated" };

@Injectable()
export class LoginOtpService {
  private readonly logger = new Logger("LoginOtpService");

  constructor(
    private readonly jwtService: JwtService,
    private readonly sessionFingerprintService: SessionFingerprintService,
    private readonly otpService: OtpService
  ) {}

  // Single decision point for the structure login flow. Returns either a
  // trusted-device verdict (caller signs JWT without rotating the session)
  // or an OTP-validated verdict (caller calls `login` for a full rotation).
  // On any other path, throws an HttpException with a stable `code` payload
  // (OTP_REQUIRED / OTP_INVALID / OTP_BLOCKED).
  async evaluate(params: {
    user: LoginUserPrincipal;
    // Forwarded into the OtpRequestContext so OTP_* security log rows carry
    // the client metadata (the trust-token check itself doesn't read them).
    ip?: string;
    userAgent?: string;
    trustToken?: string;
    otpCode?: string;
    forceResend?: boolean;
  }): Promise<LoginOtpResult> {
    const { user, ip, userAgent, trustToken, otpCode, forceResend } = params;
    const emailLog = redactEmail(user.email);

    // Domain-level bypass: when the org's mail filter quarantines our OTP
    // emails, the second factor is unusable. Operators opt-in via
    // DOMIFA_LOGIN_OTP_BYPASS_DOMAINS — listed domains get a free pass and
    // authenticate by password only. Treat the verdict as `otp_validated`
    // so the controller still rotates the session like a normal login.
    const bypassDomains = domifaConfig().security.loginOtpBypassDomains;
    if (bypassDomains.length > 0) {
      const emailDomain = user.email.split("@")[1]?.toLowerCase();
      if (emailDomain && bypassDomains.includes(emailDomain)) {
        this.logger.warn(
          `login OTP bypassed for ${emailLog} (domain "${emailDomain}" in DOMIFA_LOGIN_OTP_BYPASS_DOMAINS)`
        );
        return { kind: "otp_validated" };
      }
    }

    // Resend flow short-circuits trust and code paths: the user is on the
    // OTP modal asking for a fresh email, not trying to authenticate. Skip
    // straight to the OTP mint step.
    if (forceResend) {
      const otpContext = this.buildOtpContext(user, { ip, userAgent });
      await this.otpService.enforceOrThrow(otpContext, null, {
        forceResend: true,
      });
      throw otpHttpError("OTP_REQUIRED", HttpStatus.UNAUTHORIZED);
    }

    appLogger.info({
      event: "login_attempt",
      emailRedacted: emailLog,
      userId: user.id,
      structureId: user.structureId ?? null,
      hasTrustToken: Boolean(trustToken),
      hasOtpCode: Boolean(otpCode),
      forceResend: Boolean(forceResend),
      ip,
      userAgent,
    });

    if (trustToken) {
      const verdict = await this.tryTrustToken({
        user,
        trustToken,
      });
      if (verdict.kind === "accepted") {
        appLogger.info({
          event: "trust_token_accepted",
          userId: user.id,
          structureId: user.structureId ?? null,
          sessionUuid: verdict.session.uuid,
        });
        this.logger.log(`login OK via trust token pour ${emailLog}`);
        return { kind: "trusted", session: verdict.session };
      }
      appLogger.warn({
        event: "trust_token_rejected",
        reason: verdict.reason,
        userId: user.id,
        structureId: user.structureId ?? null,
        hasOtpCode: Boolean(otpCode),
      });
      // trust token rejected (bad sig / expired / mismatch). Fall through to
      // the OTP path so the user can still log in by entering a fresh code.
      this.logger.warn(
        `trust token KO pour ${emailLog} (reason=${
          verdict.reason
        }), fallback OTP (code fourni=${Boolean(otpCode)})`
      );
      // Record the outcome once, on the initial leg (no OTP code yet), so the
      // fingerprint study can measure trust-token attrition without producing
      // a second row when the user then submits their OTP code via the
      // OtpInterceptor retry (same body → same verdict).
      if (!otpCode) {
        const action = mapTrustRejectReasonToAction(verdict.reason);
        await this.recordTrustTokenEvent(action, user, {
          origin: "login",
          reason: verdict.reason,
          ip,
          userAgent,
        });
      }
    } else if (!otpCode) {
      // No trust token AND no OTP code = first leg of a login where the
      // device has never gone through OTP (or the local storage / cookie
      // was wiped). Log once — the OTP retry re-sends the same body so
      // skipping when `otpCode` is present dedupes the row.
      await this.recordTrustTokenEvent("TRUST_TOKEN_ABSENT", user, {
        origin: "login",
        ip,
        userAgent,
      });
    }

    const otpContext = this.buildOtpContext(user, { ip, userAgent });

    if (otpCode) {
      // enforceOrThrow handles OTP_INVALID / OTP_BLOCKED by throwing. On
      // success it returns void and we mark the login as otp_validated.
      await this.otpService.enforceOrThrow(otpContext, otpCode);
      this.logger.log(`login OK via OTP pour ${emailLog}`);
      return { kind: "otp_validated" };
    }

    // No trust token (or rejected) and no OTP code → first leg of the OTP
    // cycle: mint+send a fresh code. The current session (if any) is kept
    // intact: rotation only happens once the new OTP is validated, via
    // StructuresAuthService.login → startNewSession (closes the previous one
    // with reason REPLACED). This avoids logging the legitimate user out
    // before the new attempt has proven itself.
    await this.otpService.enforceOrThrow(otpContext, null);
    // Unreachable: kept for type narrowing.
    throw otpHttpError("OTP_REQUIRED", HttpStatus.UNAUTHORIZED);
  }

  private async tryTrustToken(params: {
    user: LoginUserPrincipal;
    trustToken: string;
  }): Promise<TrustTokenResult> {
    const { user, trustToken } = params;

    let payload: StructureTrustJwtPayload;
    try {
      payload = this.jwtService.verify<StructureTrustJwtPayload>(trustToken);
    } catch (err) {
      // Response to the client stays generic (never leak "why" to a brute
      // forcer), but we surface the reason internally so `TRUST_TOKEN_EXPIRED`
      // vs a suspicious tampered signature can be counted separately.
      if ((err as { name?: string })?.name === "TokenExpiredError") {
        return { kind: "rejected", reason: "expired" };
      }
      return { kind: "rejected", reason: "jwt_invalid" };
    }

    if (
      payload?.sub !== STRUCTURE_TRUST_JWT_SUBJECT ||
      payload.userUuid !== user.uuid ||
      payload.userId !== user.id
    ) {
      return { kind: "rejected", reason: "scope_mismatch" };
    }

    const session = await this.sessionFingerprintService.findActiveSession(
      "structure",
      user.id
    );
    if (!session) {
      // No live session → logout happened or admin revoked. Trust is gone.
      return { kind: "rejected", reason: "no_session" };
    }
    if (session.uuid !== payload.sessionUuid) {
      // Token bound to an older (rotated) session.
      return { kind: "rejected", reason: "session_uuid_mismatch" };
    }
    if (session.fingerprintHash !== payload.fingerprintHash) {
      // Fingerprint is treated as an opaque token: the trust JWT carries the
      // value minted at session creation, and we compare it verbatim against
      // the active session row. A mismatch means the session was rotated or
      // revoked since the trust token was issued → fall back to OTP. We no
      // longer recompute the hash from current IP/UA: a device-relocation
      // (mobile data ↔ wifi, browser update) should not break the trust.
      return { kind: "rejected", reason: "hash_mismatch" };
    }

    return { kind: "accepted", session };
  }

  // Best-effort side-effect: writes an observation row to app_log_security.
  // Wrapped in the writer's own try/catch so a DB hiccup can't tip the login
  // flow into an error path.
  private async recordTrustTokenEvent(
    action:
      | "TRUST_TOKEN_EXPIRED"
      | "TRUST_TOKEN_ABSENT"
      | "TRUST_TOKEN_INVALID",
    user: LoginUserPrincipal,
    request: {
      origin: "login";
      reason?: TrustTokenRejectReason;
      ip?: string;
      userAgent?: string;
    }
  ): Promise<void> {
    await logSecurityEvent({
      action,
      profile: "structure",
      userId: user.id,
      structureId: user.structureId,
      requestContext: { ip: request.ip, userAgent: request.userAgent },
      context: {
        origin: request.origin,
        ...(request.reason ? { reason: request.reason } : {}),
      },
    });
  }

  private buildOtpContext(
    user: LoginUserPrincipal,
    request: { ip?: string; userAgent?: string }
  ): OtpRequestContext {
    return {
      fingerprintHash: computeOtpFingerprint(
        {
          uuid: user.uuid,
          email: user.email,
          prenom: user.prenom,
          _userProfile: "structure",
        },
        "LOGIN",
        LOGIN_OTP_URL
      ),
      url: LOGIN_OTP_URL,
      purpose: "LOGIN",
      email: user.email,
      prenom: user.prenom,
      userType: "structure",
      userUuid: user.uuid,
      userId: user.id,
      structureId: user.structureId,
      ip: request.ip,
      userAgent: request.userAgent,
    };
  }
}

function otpHttpError(code: string, status: HttpStatus): HttpException {
  return new HttpException({ code }, status);
}

// Coarse-grained bucket for the fingerprint-study log rows. Natural drift
// (TTL age-out, session rotated by a fresh login elsewhere, admin logout) →
// TRUST_TOKEN_EXPIRED. Signals that look like tampering or a cross-user
// replay → TRUST_TOKEN_INVALID (surfaced in the suspicious-activity view).
// The precise reason is kept in `context.reason` for anyone digging deeper.
export function mapTrustRejectReasonToAction(
  reason: TrustTokenRejectReason
): "TRUST_TOKEN_EXPIRED" | "TRUST_TOKEN_INVALID" {
  if (reason === "jwt_invalid" || reason === "scope_mismatch") {
    return "TRUST_TOKEN_INVALID";
  }
  return "TRUST_TOKEN_EXPIRED";
}
