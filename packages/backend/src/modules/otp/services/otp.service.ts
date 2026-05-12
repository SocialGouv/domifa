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
  reason?: "expired" | "invalid" | "max-attempts";
}

function redactEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***";
  const visible = local.slice(0, 1);
  return `${visible}***@${domain}`;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger("OtpService");

  constructor(private readonly otpEmailService: OtpEmailService) {}

  private hashCode(code: string): string {
    return createHash("sha256").update(code).digest("hex");
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

    const validOtp = await otpRepository.findValidOtp(
      email,
      hashedCode,
      OTP_MAX_ATTEMPTS
    );

    if (validOtp) {
      validOtp.used = true;
      await otpRepository.save(validOtp);
      this.logger.log(`OTP verifie avec succes pour ${emailLog}`);
      return { valid: true };
    }

    const pendingOtp = await otpRepository
      .createQueryBuilder("otp")
      .where("otp.email = :email", { email })
      .andWhere("otp.used = false")
      .orderBy("otp.createdAt", "DESC")
      .getOne();

    if (!pendingOtp) {
      this.logger.debug(
        `OTP verification echouee pour ${emailLog}: aucun OTP trouve`
      );
      return { valid: false, reason: "invalid" };
    }

    if (pendingOtp.expiresAt < new Date()) {
      this.logger.debug(`OTP verification echouee pour ${emailLog}: expire`);
      return { valid: false, reason: "expired" };
    }

    if (pendingOtp.attempts >= OTP_MAX_ATTEMPTS) {
      this.logger.warn(
        `OTP verification echouee pour ${emailLog}: max tentatives atteint`
      );
      return { valid: false, reason: "max-attempts" };
    }

    await otpRepository.incrementAttempts(pendingOtp.uuid);
    this.logger.debug(
      `OTP verification echouee pour ${emailLog}: code invalide (tentative ${
        pendingOtp.attempts + 1
      }/${OTP_MAX_ATTEMPTS})`
    );
    return { valid: false, reason: "invalid" };
  }
}
