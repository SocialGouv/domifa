import { Module } from "@nestjs/common";
import { OtpController } from "./otp.controller";
import { OtpService } from "./services/otp.service";
import { OtpEmailService } from "./services/otp-email.service";
import { OtpCleaner } from "./services/otp-cleaner.service";

@Module({
  controllers: [OtpController],
  providers: [OtpService, OtpEmailService, OtpCleaner],
  exports: [OtpService],
})
export class OtpModule {}
