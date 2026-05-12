import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
import { Throttle } from "@nestjs/throttler";
import { GenerateOtpDto } from "./dto/generate-otp.dto";
import { VerifyOtpDto } from "./dto/verify-otp.dto";
import {
  OtpService,
  OtpGenerationResult,
  OtpVerificationResult,
} from "./services/otp.service";

@Controller("otp")
@ApiTags("otp")
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @ApiOperation({
    summary:
      "Endpoint public : genere un OTP a 6 chiffres et l'envoie par email",
  })
  @Throttle({
    short: { limit: 3, ttl: 60_000, blockDuration: 1_800_000 },
    medium: { limit: 5, ttl: 600_000, blockDuration: 1_800_000 },
    long: { limit: 10, ttl: 3_600_000, blockDuration: 3_600_000 },
  })
  @Post("generate")
  async generate(@Body() dto: GenerateOtpDto): Promise<OtpGenerationResult> {
    return this.otpService.generateAndSend(dto);
  }

  @ApiOperation({ summary: "Endpoint public : verifie un OTP a 6 chiffres" })
  @Throttle({
    short: { limit: 10, ttl: 60_000, blockDuration: 1_800_000 },
    medium: { limit: 30, ttl: 600_000, blockDuration: 1_800_000 },
  })
  @Post("verify")
  async verify(@Body() dto: VerifyOtpDto): Promise<OtpVerificationResult> {
    return this.otpService.verify(dto);
  }
}
