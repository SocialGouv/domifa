import { InteractionsModule } from "./../interactions/interactions.module";
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
    MessageSmsSenderService,
    MessageSmsService,
    CronSmsInteractionSenderService,
    CronSmsFetchEndDomService,
    CronSmsEndDomSenderService,
  ],
  imports: [
    HttpModule,
    forwardRef(() => StructuresModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => InteractionsModule),
  ],
  providers: [
    MessageSmsSenderService,
    MessageSmsService,
    CronSmsInteractionSenderService,
    CronSmsFetchEndDomService,
    CronSmsEndDomSenderService,
  ],
})
export class SmsModule {}
