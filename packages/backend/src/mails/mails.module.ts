import { forwardRef, HttpModule, Module } from "@nestjs/common";
import { DatabaseModule } from "../database";
import { InteractionsModule } from "../interactions/interactions.module";
import { StructuresMailsService } from "../mails/services/structures-mails.service";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import { CronMailImportGuideSenderService } from "./services/cron-mail-import-guide-sender.service";
import { CronMailUserGuideSenderService } from "./services/cron-mail-user-guide-sender.service";
import { DomifaMailsService } from "./services/domifa-mails.service";
import { TipimailSender } from "./services/tipimail-sender.service";
import { UsagersMailsService } from "./services/usagers-mails.service";
import { UsersMailsService } from "./services/users-mails.service";

@Module({
  controllers: [],
  exports: [
    StructuresMailsService,
    DomifaMailsService,
    UsagersMailsService,
    UsersMailsService,
    TipimailSender,
    CronMailImportGuideSenderService,
    CronMailUserGuideSenderService,
  ],
  providers: [
    StructuresMailsService,
    DomifaMailsService,
    UsagersMailsService,
    UsersMailsService,
    TipimailSender,
    CronMailImportGuideSenderService,
    CronMailUserGuideSenderService,
  ],
  imports: [
    DatabaseModule,
    HttpModule,
    forwardRef(() => StructuresModule),
    forwardRef(() => UsersModule),
    forwardRef(() => UsagersModule),
    forwardRef(() => InteractionsModule),
  ],
})
export class MailsModule {}
