import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

import {
  CurrentUserSession,
  STRUCTURE_TRUST_JWT_SUBJECT,
  StructureTrustJwtPayload,
} from "../../_common/model";
import { computeOtpFingerprint } from "../../modules/otp/otp-fingerprint.helper";
import { OtpService } from "../../modules/otp/services/otp.service";
import { OtpRequestContext } from "../../modules/otp/otp.types";
import { redactEmail } from "../../modules/otp/otp.utils";
import { SessionFingerprintService } from "./session-fingerprint.service";

// Scoping values for the login OTP. Stable across all login OTP requests so
// generateOrResend / claim hit the same row.
const LOGIN_OTP_URL = "POST /structures/auth/login";

export type LoginUserPrincipal = {
  id: number;
  uuid: string;
  email: string;
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
    ip: string;
    userAgent: string;
    trustToken?: string;
    otpCode?: string;
  }): Promise<LoginOtpResult> {
    const { user, ip, userAgent, trustToken, otpCode } = params;
    const emailLog = redactEmail(user.email);

    if (trustToken) {
      const trusted = await this.tryTrustToken({
        user,
        ip,
        userAgent,
        trustToken,
      });
      if (trusted) {
        this.logger.log(`login OK via trust token pour ${emailLog}`);
        return { kind: "trusted", session: trusted };
      }
      // trust token rejected (bad sig / expired / mismatch). Fall through to
      // the OTP path so the user can still log in by entering a fresh code.
      this.logger.warn(
        `trust token KO pour ${emailLog}, fallback OTP (code fourni=${Boolean(
          otpCode
        )})`
      );
    }

    const otpContext = this.buildOtpContext(user);

    if (otpCode) {
      // enforceOrThrow handles OTP_INVALID / OTP_BLOCKED by throwing. On
      // success it returns void and we mark the login as otp_validated.
      await this.otpService.enforceOrThrow(otpContext, otpCode);
      this.logger.log(`login OK via OTP pour ${emailLog}`);
      return { kind: "otp_validated" };
    }

    // No trust token (or rejected) and no OTP code → first leg of the OTP
    // cycle: drop the current session (so any straggling JWT can't keep the
    // door open) and ask OtpService to mint+send a fresh code.
    await this.sessionFingerprintService.closeActiveSession(
      "structure",
      user.id,
      "OTP_REQUIRED"
    );
    // enforceOrThrow with code=null always throws (OTP_REQUIRED on the happy
    // path, OTP_BLOCKED / OTP_RESEND_LIMIT otherwise). The throw is what the
    // controller surfaces to the client.
    await this.otpService.enforceOrThrow(otpContext, null);
    // Unreachable: kept for type narrowing.
    throw otpHttpError("OTP_REQUIRED", HttpStatus.UNAUTHORIZED);
  }

  private async tryTrustToken(params: {
    user: LoginUserPrincipal;
    ip: string;
    userAgent: string;
    trustToken: string;
  }): Promise<CurrentUserSession | null> {
    const { user, ip, userAgent, trustToken } = params;

    let payload: StructureTrustJwtPayload;
    try {
      payload = this.jwtService.verify<StructureTrustJwtPayload>(trustToken);
    } catch {
      // Bad signature / expired — both surface as a generic rejection. We
      // never tell the client why so a brute-forcer can't distinguish.
      return null;
    }

    if (
      payload?.sub !== STRUCTURE_TRUST_JWT_SUBJECT ||
      payload.userUuid !== user.uuid ||
      payload.userId !== user.id
    ) {
      return null;
    }

    const session = await this.sessionFingerprintService.findActiveSession(
      "structure",
      user.id
    );
    if (!session) {
      // No live session → logout happened or admin revoked. Trust is gone.
      return null;
    }
    if (session.uuid !== payload.sessionUuid) {
      // Token bound to an older (rotated) session.
      return null;
    }
    if (session.fingerprintHash !== payload.fingerprintHash) {
      // Defense in depth: session record was tampered with or out of sync.
      return null;
    }

    const expectedFingerprint =
      this.sessionFingerprintService.computeFingerprint(
        user.uuid,
        ip,
        userAgent,
        payload.salt
      );
    if (expectedFingerprint !== payload.fingerprintHash) {
      // IP/UA changed → device is no longer "this device". Fall back to OTP.
      return null;
    }

    return session;
  }

  private buildOtpContext(user: LoginUserPrincipal): OtpRequestContext {
    return {
      fingerprintHash: computeOtpFingerprint(
        { uuid: user.uuid, email: user.email, _userProfile: "structure" },
        "LOGIN",
        LOGIN_OTP_URL
      ),
      url: LOGIN_OTP_URL,
      purpose: "LOGIN",
      email: user.email,
      userType: "structure",
      userUuid: user.uuid,
    };
  }
}

function otpHttpError(code: string, status: HttpStatus): HttpException {
  return new HttpException({ code }, status);
}
