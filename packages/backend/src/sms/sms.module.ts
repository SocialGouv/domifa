import { forwardRef, HttpModule, Module } from "@nestjs/common";
import { DatabaseModule } from "../database";
import { InteractionsModule } from "../interactions/interactions.module";
import { MailsModule } from "../mails/mails.module";
import { StatsModule } from "../stats/stats.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";

import { SmsController } from "./sms.controller";

@Module({
  controllers: [SmsController],
  exports: [],
  imports: [
    DatabaseModule,
    HttpModule,
    forwardRef(() => StructuresModule),
    forwardRef(() => UsersModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => StatsModule),
    forwardRef(() => InteractionsModule),
  ],
  providers: [],
})
export class SmsModule {}
