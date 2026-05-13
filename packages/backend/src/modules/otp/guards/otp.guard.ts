import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";

import { OTP_PURPOSE_METADATA_KEY } from "../decorators/require-otp.decorator";
import { OTP_CODE_HEADER } from "../otp.constants";
import { computeOtpFingerprint } from "../otp-fingerprint.helper";
import {
  AuthenticatedOtpUser,
  OtpPurpose,
  OtpRequestContext,
} from "../otp.types";
import { OtpService } from "../services/otp.service";

@Injectable()
export class OtpGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly otpService: OtpService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const purpose = this.reflector.get<OtpPurpose>(
      OTP_PURPOSE_METADATA_KEY,
      context.getHandler()
    );
    if (!purpose) {
      return true;
    }

    const req = context.switchToHttp().getRequest<Request>();
    const otpContext = this.buildContext(req, purpose);
    const code = readOtpCode(req);

    return code ? this.claim(otpContext, code) : this.requestOtp(otpContext);
  }

  private async claim(context: OtpRequestContext, code: string): Promise<true> {
    const result = await this.otpService.claim(context, code);

    if (result.valid === true) {
      return true;
    }

    if (result.reason === "blocked") {
      throw otpError("OTP_BLOCKED", HttpStatus.TOO_MANY_REQUESTS);
    }
    throw otpError("OTP_INVALID", HttpStatus.UNAUTHORIZED);
  }

  private async requestOtp(context: OtpRequestContext): Promise<never> {
    const result = await this.otpService.generateOrResend(context);

    if (result.kind === "blocked") {
      throw otpError("OTP_BLOCKED", HttpStatus.TOO_MANY_REQUESTS);
    }
    if (result.kind === "resend_limit_reached") {
      throw otpError("OTP_RESEND_LIMIT", HttpStatus.TOO_MANY_REQUESTS);
    }
    throw otpError("OTP_REQUIRED", HttpStatus.UNAUTHORIZED);
  }

  private buildContext(req: Request, purpose: OtpPurpose): OtpRequestContext {
    const user = req.user as AuthenticatedOtpUser | undefined;
    if (!user?.email || !user._userProfile) {
      throw otpError("OTP_UNAUTHENTICATED", HttpStatus.UNAUTHORIZED);
    }

    return {
      fingerprintHash: computeOtpFingerprint(req, user, purpose),
      url: normalizeUrl(req),
      purpose,
      email: user.email,
      userType: user._userProfile,
      userUuid: user.uuid ?? null,
    };
  }
}

function readOtpCode(req: Request): string | null {
  const raw = req.headers[OTP_CODE_HEADER];
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  // 6-digit codes only — anything else is malformed or hostile (binary
  // payload, base64 blob, oversized fuzz). Treat as "no code provided" so
  // the request is asked to retry instead of burning an attempt against the
  // stored HMAC.
  return /^\d{6}$/.test(trimmed) ? trimmed : null;
}

function normalizeUrl(req: Request): string {
  const route = (req as Request & { route?: { path?: string } }).route?.path;
  const basePath = (req as Request & { baseUrl?: string }).baseUrl ?? "";

  if (route) {
    return `${req.method} ${basePath}${route}`;
  }
  return `${req.method} ${req.originalUrl.split("?")[0]}`;
}

function otpError(code: string, status: HttpStatus): HttpException {
  return new HttpException({ code }, status);
}
