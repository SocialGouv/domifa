import { forwardRef, HttpModule, Module } from "@nestjs/common";
import { DatabaseModule } from "../database";
import { InteractionsModule } from "../interactions/interactions.module";
import { StructuresModule } from "../structures/structure.module";
import { UsagersModule } from "../usagers/usagers.module";
import { UsersModule } from "../users/users.module";
import {
  CronMailImportGuideSenderService,
  CronMailUserGuideSenderService,
  DomifaMailsService,
  StructuresMailsService,
  UsagersMailsService,
  UsersMailsService,
} from "./services";
import { MessageEmailConsummer, TipimailSender } from "./services/_core";

@Module({
  controllers: [],
  exports: [
    StructuresMailsService,
    DomifaMailsService,
    UsagersMailsService,
    UsersMailsService,
    TipimailSender,
    MessageEmailConsummer,
    CronMailImportGuideSenderService,
    CronMailUserGuideSenderService,
  ],
  providers: [
    StructuresMailsService,
    DomifaMailsService,
    TipimailSender,
    UsagersMailsService,
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
