import { forwardRef, HttpModule, Module } from "@nestjs/common";

import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { CronSmsInteractionSenderService } from "./services/cron-sms-interaction-sender.service";

import { MessageSmsSenderService } from "./services/message-sms-sender.service";
import { SmsService } from "./services/sms.service";
import { SmsController } from "./sms.controller";

@Module({
  controllers: [SmsController],
  exports: [
    SmsService,
    CronSmsInteractionSenderService,
    MessageSmsSenderService,
  ],
  imports: [
    HttpModule,
    forwardRef(() => StructuresModule),
    forwardRef(() => UsagersModule),
  ],
  providers: [
    SmsService,
    CronSmsInteractionSenderService,
    MessageSmsSenderService,
  ],
})
export class SmsModule {}
