import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { createHash, randomInt } from "node:crypto";
import { otpRepository } from "../../../database";
import { GenerateOtpDto } from "../dto/generate-otp.dto";
import { VerifyOtpDto } from "../dto/verify-otp.dto";
import {
  OTP_EXPIRATION_MINUTES,
  OTP_MAX_ATTEMPTS,
  OTP_RATE_LIMIT_MAX,
  OTP_RATE_LIMIT_WINDOW_MINUTES,
} from "../otp.constants";
import { OtpEmailService } from "./otp-email.service";

export interface OtpGenerationResult {
  success: boolean;
  expiresAt: Date;
}

export interface OtpVerificationResult {
  valid: boolean;
  reason?: "expired" | "invalid" | "max-attempts" | "already-used";
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger("OtpService");

  constructor(private readonly otpEmailService: OtpEmailService) {}

  private hashCode(code: string): string {
    return createHash("sha256").update(code).digest("hex");
  }

  async generateAndSend(dto: GenerateOtpDto): Promise<OtpGenerationResult> {
    const { email, purpose } = dto;

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

    const code = randomInt(100000, 999999).toString();
    const hashedCode = this.hashCode(code);
    const expiresAt = new Date(Date.now() + OTP_EXPIRATION_MINUTES * 60 * 1000);

    await otpRepository.save({
      email,
      code: hashedCode,
      expiresAt,
      purpose: purpose ?? null,
    });

    this.logger.log(
      `OTP genere pour ${email} (purpose: ${
        purpose ?? "none"
      }, expire: ${expiresAt.toISOString()})`
    );

    await this.otpEmailService.sendOtpEmail(email, code);

    return { success: true, expiresAt };
  }

  async verify(dto: VerifyOtpDto): Promise<OtpVerificationResult> {
    const { email, code } = dto;
    const hashedCode = this.hashCode(code);

    const validOtp = await otpRepository.findValidOtp(
      email,
      hashedCode,
      OTP_MAX_ATTEMPTS
    );

    if (validOtp) {
      validOtp.used = true;
      await otpRepository.save(validOtp);
      this.logger.log(`OTP verifie avec succes pour ${email}`);
      return { valid: true };
    }

    const pendingOtp = await otpRepository
      .createQueryBuilder("otp")
      .where("otp.email = :email", { email })
      .andWhere("otp.used = false")
      .orderBy("otp.createdAt", "DESC")
      .getOne();

    if (!pendingOtp) {
      this.logger.warn(
        `OTP verification echouee pour ${email}: aucun OTP trouve`
      );
      return { valid: false, reason: "invalid" };
    }

    if (pendingOtp.expiresAt < new Date()) {
      this.logger.warn(`OTP verification echouee pour ${email}: expire`);
      return { valid: false, reason: "expired" };
    }

    if (pendingOtp.attempts >= OTP_MAX_ATTEMPTS) {
      this.logger.warn(
        `OTP verification echouee pour ${email}: max tentatives atteint`
      );
      return { valid: false, reason: "max-attempts" };
    }

    await otpRepository.incrementAttempts(pendingOtp.uuid);
    this.logger.warn(
      `OTP verification echouee pour ${email}: code invalide (tentative ${
        pendingOtp.attempts + 1
      }/${OTP_MAX_ATTEMPTS})`
    );
    return { valid: false, reason: "invalid" };
  }
}
