import { forwardRef, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";

import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { SmsController } from "./sms.controller";
import { CronSmsFetchEndDomService } from "./services/senders/cron-sms-fetch-end-dom.service";
import { MessageSmsSenderService } from "./services/message-sms-sender.service";
import { MessageSmsService } from "./services/message-sms.service";
import {
  CronSmsInteractionSenderService,
  CronSmsEndDomSenderService,
} from "./services/senders";

@Module({
  controllers: [SmsController],
  exports: [
    MessageSmsService,
    CronSmsInteractionSenderService,
    CronSmsFetchEndDomService,
    CronSmsEndDomSenderService,
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
    CronSmsFetchEndDomService,
    CronSmsEndDomSenderService,
    MessageSmsSenderService,
  ],
})
export class SmsModule {}
