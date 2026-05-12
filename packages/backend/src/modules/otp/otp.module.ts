import { Module } from "@nestjs/common";
import { OtpController } from "./otp.controller";
import { OtpService } from "./services/otp.service";
import { OtpEmailService } from "./services/otp-email.service";

@Module({
  controllers: [OtpController],
  providers: [OtpService, OtpEmailService],
  exports: [OtpService],
})
export class OtpModule {}
