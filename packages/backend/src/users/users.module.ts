import { forwardRef, Module, HttpModule } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";

import { ConfigService } from "../config/config.service";
import { DatabaseModule } from "../database/database.module";
import { StructuresModule } from "../structures/structure.module";

import { MailJetService } from "./services/mailjet.service";

import { UsersService } from "./services/users.service";
import { UsersController } from "./users.controller";
import { UsersProviders } from "./users.providers";
import { CronMailsService } from "../mails/services/cron-mails.service";
import { MailsModule } from "../mails/mails.module";

@Module({
  controllers: [UsersController],
  exports: [UsersService, ...UsersProviders, MailJetService, CronMailsService],
  imports: [
    DatabaseModule,
    HttpModule,
    forwardRef(() => AuthModule),
    forwardRef(() => MailsModule),
    forwardRef(() => StructuresModule),
  ],
  providers: [
    UsersService,
    MailJetService,
    CronMailsService,
    ConfigService,
    ...UsersProviders,
  ],
})
export class UsersModule {}
