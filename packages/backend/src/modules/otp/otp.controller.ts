import { Body, Controller, Post } from "@nestjs/common";
import { ApiOperation, ApiTags } from "@nestjs/swagger";
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
    summary: "Generer un OTP a 6 chiffres et l'envoyer par email",
  })
  @Post("generate")
  async generate(@Body() dto: GenerateOtpDto): Promise<OtpGenerationResult> {
    return this.otpService.generateAndSend(dto);
  }

  @ApiOperation({ summary: "Verifier un OTP a 6 chiffres" })
  @Post("verify")
  async verify(@Body() dto: VerifyOtpDto): Promise<OtpVerificationResult> {
    return this.otpService.verify(dto);
  }
}
