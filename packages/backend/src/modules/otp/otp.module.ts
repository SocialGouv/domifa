import { forwardRef, Module } from "@nestjs/common";

import { OtpGuard } from "./guards/otp.guard";
import { OtpService } from "./services/otp.service";
import { OtpEmailService } from "./services/otp-email.service";
import { OtpCleaner } from "./services/otp-cleaner.service";
import { MailsModule } from "../mails/mails.module";

@Module({
  imports: [forwardRef(() => MailsModule)],
  providers: [OtpService, OtpEmailService, OtpCleaner, OtpGuard],
  exports: [OtpService, OtpGuard],
})
export class OtpModule {}
