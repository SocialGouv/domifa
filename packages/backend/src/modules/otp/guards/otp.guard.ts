import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import validator from "validator";

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
    if (!user?.email || !user._userProfile || !user.uuid) {
      throw otpError("OTP_UNAUTHENTICATED", HttpStatus.UNAUTHORIZED);
    }

    const url = normalizeUrl(req);

    return {
      fingerprintHash: computeOtpFingerprint(user, purpose, url),
      url,
      purpose,
      email: user.email,
      userType: user._userProfile,
      userUuid: user.uuid,
    };
  }
}

function readOtpCode(req: Request): string | null {
  const raw = req.headers[OTP_CODE_HEADER];
  if (typeof raw !== "string") {
    return null;
  }
  const trimmed = raw.trim();
  // 6-digit numeric codes only. Anything else (binary payload, base64 blob,
  // oversized fuzz) is treated as "no code provided" so the request hits the
  // requestOtp branch instead of burning an attempt against the stored HMAC.
  if (!validator.isLength(trimmed, { min: 6, max: 6 })) {
    return null;
  }
  if (!validator.isNumeric(trimmed, { no_symbols: true })) {
    return null;
  }
  return trimmed;
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
