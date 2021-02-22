import { forwardRef, HttpModule, Module } from "@nestjs/common";
import { DatabaseModule } from "../database";
import { InteractionsModule } from "../interactions/interactions.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import {
  CronMailImportGuideSenderService,
  CronMailUserGuideSenderService,
  StructuresMailsService,
  UsersMailsService,
} from "./services";
import { MessageEmailConsummer, TipimailSender } from "./services/_core";

@Module({
  controllers: [],
  exports: [
    StructuresMailsService,
    UsersMailsService,
    TipimailSender,
    MessageEmailConsummer,
    CronMailImportGuideSenderService,
    CronMailUserGuideSenderService,
  ],
  providers: [
    StructuresMailsService,
    TipimailSender,
    UsersMailsService,
    MessageEmailConsummer,
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
