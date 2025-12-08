import { forwardRef, Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { InteractionsModule } from "../interactions/interactions.module";

import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { BrevoSenderService } from "./services/brevo-sender/brevo-sender.service";
import { BrevoSyncCronService } from "./services/brevo-sync-cron.service";

@Module({
  exports: [BrevoSenderService],
  providers: [BrevoSenderService, BrevoSyncCronService],
  imports: [
    HttpModule,
    forwardRef(() => StructuresModule),
    forwardRef(() => UsersModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => InteractionsModule),
  ],
})
export class MailsModule {}
