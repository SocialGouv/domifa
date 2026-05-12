import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { createHash, createHmac, randomInt } from "node:crypto";
import { domifaConfig } from "../../../config";
import { otpRepository } from "../../../database";
import { GenerateOtpDto } from "../dto/generate-otp.dto";
import { VerifyOtpDto } from "../dto/verify-otp.dto";
import {
  OTP_EXPIRATION_MINUTES,
  OTP_MAX_ATTEMPTS,
  OTP_RATE_LIMIT_MAX,
  OTP_RATE_LIMIT_WINDOW_MINUTES,
} from "../otp.constants";
import { redactEmail } from "../otp.utils";
import { OtpEmailService } from "./otp-email.service";

export interface OtpGenerationResult {
  success: boolean;
  expiresAt: Date;
}

export interface OtpVerificationResult {
  valid: boolean;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger("OtpService");
  private pepperWarned = false;

  constructor(private readonly otpEmailService: OtpEmailService) {}

  // HMAC-SHA256 with a server-side pepper, falling back to plain SHA-256
  // when no pepper is configured (dev/test). The pepper makes a DB dump
  // unusable for rainbow-table attacks (10^6 codes precomputed in <1s).
  private hashCode(code: string): string {
    const { pepper } = domifaConfig().otp;
    const { envId } = domifaConfig();
    if (!pepper) {
      if (!this.pepperWarned && (envId === "prod" || envId === "preprod")) {
        this.logger.warn(
          "DOMIFA_OTP_PEPPER not configured: OTP codes are hashed with plain SHA-256, which is vulnerable to rainbow-table attacks on a DB dump. Configure DOMIFA_OTP_PEPPER via sealed-secrets."
        );
        this.pepperWarned = true;
      }
      return createHash("sha256").update(code).digest("hex");
    }
    return createHmac("sha256", pepper).update(code).digest("hex");
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  async generateAndSend(dto: GenerateOtpDto): Promise<OtpGenerationResult> {
    const email = this.normalizeEmail(dto.email);
    const { purpose } = dto;
    const emailLog = redactEmail(email);

    const recentCount = await otpRepository.countRecentByEmail(
      email,
      OTP_RATE_LIMIT_WINDOW_MINUTES
    );
    if (recentCount >= OTP_RATE_LIMIT_MAX) {
      throw new HttpException(
        "Trop de demandes de code. Veuillez patienter avant de reessayer.",
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    const code = randomInt(100000, 1000000).toString();
    const hashedCode = this.hashCode(code);
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    await otpRepository.save({
      email,
      code: hashedCode,
      expiresAt,
      purpose: purpose ?? null,
    });

    this.logger.log(
      `OTP genere pour ${emailLog} (purpose: ${
        purpose ?? "none"
      }, expire: ${expiresAt.toISOString()})`
    );

    await this.otpEmailService.sendOtpEmail(email, code);

    return { success: true, expiresAt };
  }

  async verify(dto: VerifyOtpDto): Promise<OtpVerificationResult> {
    const email = this.normalizeEmail(dto.email);
    const { code } = dto;
    const hashedCode = this.hashCode(code);
    const emailLog = redactEmail(email);

    // Good-code path: atomic claim (single UPDATE), single-use guaranteed.
    const claimed = await otpRepository.claimValidOtp(
      email,
      hashedCode,
      OTP_MAX_ATTEMPTS
    );
    if (claimed) {
      this.logger.log(`OTP verifie avec succes pour ${emailLog}`);
      return { valid: true };
    }

    // Bad-code path: atomically increment attempts on the latest eligible
    // pending OTP (no race vs parallel verifications).
    const incremented = await otpRepository.incrementLatestPendingAttempts(
      email,
      OTP_MAX_ATTEMPTS
    );
    if (incremented) {
      this.logger.debug(
        `OTP verification echouee pour ${emailLog}: code invalide (tentative ${incremented.attempts}/${OTP_MAX_ATTEMPTS})`
      );
    } else {
      this.logger.debug(
        `OTP verification echouee pour ${emailLog}: pas d'OTP eligible`
      );
    }
    // Unified response: the cause (none / expired / max-attempts / wrong code)
    // is intentionally hidden to avoid leaking whether an email recently
    // requested an OTP. Distinction stays in server logs.
    return { valid: false };
  }
}
