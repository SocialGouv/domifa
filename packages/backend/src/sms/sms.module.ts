import { forwardRef, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";

import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { CronSmsInteractionSenderService } from "./services/cron-sms-interaction-sender.service";
import { CronSmsFetchEndDomService } from "./services/cron-sms-fetch-end-dom.service";
import { CronSmsEndDomSenderService } from "./services/cron-sms-end-dom-sender.service";
import { MessageSmsSenderService } from "./services/message-sms-sender.service";
import { MessageSmsService } from "./services/message-sms.service";
import { SmsController } from "./sms.controller";

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
