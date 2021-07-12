import { forwardRef, HttpModule, Module } from "@nestjs/common";

import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { CronSmsInteractionSenderService } from "./services/cron-sms-interaction-sender.service";

import { MessageSmsSenderService } from "./services/message-sms-sender.service";
import { MessageSmsService } from "./services/message-sms.service";
import { SmsController } from "./sms.controller";

@Module({
  controllers: [SmsController],
  exports: [
    MessageSmsService,
    CronSmsInteractionSenderService,
    MessageSmsSenderService,
  ],
  imports: [
    HttpModule,
    forwardRef(() => StructuresModule),
    forwardRef(() => UsagersModule),
  ],
  providers: [
    MessageSmsService,
    CronSmsInteractionSenderService,
    MessageSmsSenderService,
  ],
})
export class SmsModule {}
