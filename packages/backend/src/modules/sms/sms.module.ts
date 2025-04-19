import { SmsController } from "./sms.controller";
import { CronSmsFetchEndDomService } from "./services/senders/cron-sms-fetch-end-dom.service";
import { MessageSmsSenderService } from "./services/message-sms-sender.service";
import { MessageSmsService } from "./services/message-sms.service";
import { CronSmsInteractionSenderService } from "./services/senders";
import { HttpModule } from "@nestjs/axios";
import { forwardRef, Module } from "@nestjs/common";

import { InteractionsModule } from "../interactions/interactions.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";

@Module({
  controllers: [SmsController],
  exports: [
    MessageSmsSenderService,
    MessageSmsService,
    CronSmsInteractionSenderService,
    CronSmsFetchEndDomService,
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
  ],
})
export class SmsModule {}
