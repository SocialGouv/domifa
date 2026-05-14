import { Module } from "@nestjs/common";

import { OtpGuard } from "./guards/otp.guard";
import { OtpService } from "./services/otp.service";
import { OtpEmailService } from "./services/otp-email.service";
import { OtpCleaner } from "./services/otp-cleaner.service";

@Module({
  providers: [OtpService, OtpEmailService, OtpCleaner, OtpGuard],
  exports: [OtpService, OtpGuard],
})
export class OtpModule {}
